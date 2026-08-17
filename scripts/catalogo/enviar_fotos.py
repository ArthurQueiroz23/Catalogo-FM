# -*- coding: utf-8 -*-
"""Envia as fotos do catálogo ao Cloudinary e as associa aos produtos já cadastrados.

Percorre exatamente o mesmo caminho do painel (ver `frontend/src/lib/cloudinary-upload.ts`):
pede uma assinatura ao backend, envia o arquivo direto ao Cloudinary — o backend nunca recebe o
binário — e registra a URL e o `public_id` na galeria do produto.

**Pré-requisito:** as credenciais reais do Cloudinary precisam estar em `backend/.env`
(`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) e o backend precisa ter
sido reiniciado depois disso. Com os valores de exemplo (`xxx`) o Cloudinary responde
`401 Invalid api_key` e nenhuma foto é enviada.

É idempotente: produtos que já têm foto na galeria são pulados, então dá para rodar de novo
depois de corrigir uma credencial ou uma foto sem duplicar nada.

Uso:
    python enviar_fotos.py --email admin@... --senha ... [--limite N]
"""
import argparse
import json
import mimetypes
import os
import sys
import unicodedata
import urllib.error
import urllib.request
import uuid

from importar_catalogo import Api, entrar

AQUI = os.path.dirname(os.path.abspath(__file__))
PASTA_FOTOS = os.path.abspath(os.path.join(AQUI, "..", "..", "referencias", "fotos-catalogo"))


def sanitizar_segmento(texto):
    """Mesma normalização do painel: o backend só aceita letras, números, hífen e underscore."""
    sem_acento = "".join(c for c in unicodedata.normalize("NFD", texto)
                         if not unicodedata.combining(c))
    limpo = "".join(c if c.isalnum() or c in "_-" else "-" for c in sem_acento)
    while "--" in limpo:
        limpo = limpo.replace("--", "-")
    return limpo.strip("-")


def montar_multipart(campos, nome_arquivo, binario):
    """Monta um corpo multipart/form-data sem depender de biblioteca externa."""
    limite = "----frutodamalha" + uuid.uuid4().hex
    linhas = []
    for chave, valor in campos.items():
        linhas.append(f"--{limite}\r\nContent-Disposition: form-data; name=\"{chave}\"\r\n\r\n{valor}\r\n".encode())
    tipo = mimetypes.guess_type(nome_arquivo)[0] or "application/octet-stream"
    linhas.append(
        f"--{limite}\r\nContent-Disposition: form-data; name=\"file\"; "
        f"filename=\"{nome_arquivo}\"\r\nContent-Type: {tipo}\r\n\r\n".encode()
        + binario + b"\r\n"
    )
    linhas.append(f"--{limite}--\r\n".encode())
    return b"".join(linhas), f"multipart/form-data; boundary={limite}"


def enviar_ao_cloudinary(assinatura, caminho):
    campos = {
        "api_key": assinatura["apiKey"],
        "timestamp": str(assinatura["timestamp"]),
        "signature": assinatura["signature"],
        "folder": assinatura["folder"],
    }
    with open(caminho, "rb") as f:
        corpo, content_type = montar_multipart(campos, os.path.basename(caminho), f.read())

    url = f"https://api.cloudinary.com/v1_1/{assinatura['cloudName']}/image/upload"
    req = urllib.request.Request(url, data=corpo, method="POST")
    req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            dados = json.loads(r.read().decode())
            return dados["secure_url"], dados["public_id"]
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Cloudinary HTTP {e.code}: {e.read().decode(errors='replace')[:300]}") from None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://localhost:8080/api/v1")
    ap.add_argument("--email", required=True)
    ap.add_argument("--senha", required=True)
    ap.add_argument("--limite", type=int, default=None)
    args = ap.parse_args()

    if not os.path.isdir(PASTA_FOTOS):
        sys.exit(f"Pasta de fotos não encontrada: {PASTA_FOTOS}\n"
                 f"Rode antes o extrator de fotos do PDF.")

    dados = json.load(open(os.path.join(AQUI, "catalogo.json"), encoding="utf-8"))
    api = Api(args.api, entrar(args.api, args.email, args.senha))

    por_ref, pagina, total_paginas = {}, 0, 1
    while pagina < total_paginas:
        resp = api.get(f"/admin/produtos?page={pagina}&size=100&incluirExcluidos=true")
        for p in resp["content"]:
            por_ref[p["referencia"]] = p["id"]
        total_paginas, pagina = resp["totalPages"] or 1, pagina + 1

    produtos = dados["produtos"][:args.limite] if args.limite else dados["produtos"]
    enviadas, pulados, falhas = 0, 0, []

    for prod in produtos:
        ref = prod["referencia"]
        pid = por_ref.get(ref)
        if not pid:
            falhas.append((ref, "produto não está cadastrado"))
            continue

        atual = api.get(f"/admin/produtos/{pid}")
        if atual.get("imagens"):
            pulados += 1
            print(f"  = [{prod['ordem']:>2}] {ref} já tem {len(atual['imagens'])} foto(s)")
            continue

        pasta = f"produtos/{sanitizar_segmento(ref)}"
        for arquivo in prod["fotos"]:
            caminho = os.path.join(PASTA_FOTOS, arquivo)
            if not os.path.exists(caminho):
                falhas.append((ref, f"arquivo ausente: {arquivo}"))
                continue
            try:
                assinatura = api.post("/admin/uploads/signature",
                                      {"resourceType": "image", "folder": pasta})
                url, public_id = enviar_ao_cloudinary(assinatura, caminho)
                api.post(f"/admin/produtos/{pid}/imagens", {"url": url, "publicId": public_id})
                enviadas += 1
                print(f"  + [{prod['ordem']:>2}] {ref} <- {arquivo}")
            except RuntimeError as erro:
                falhas.append((ref, f"{arquivo}: {erro}"))
                print(f"  ! [{prod['ordem']:>2}] {ref} FALHOU: {erro}")

    print(f"\nresumo: {enviadas} fotos enviadas | {pulados} produtos já tinham foto "
          f"| {len(falhas)} falhas")
    for ref, erro in falhas:
        print(f"  FALHA {ref}: {erro}")
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main())
