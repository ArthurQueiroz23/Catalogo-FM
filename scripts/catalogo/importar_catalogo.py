# -*- coding: utf-8 -*-
"""Cadastra o catálogo do Fruto da Malha pela API do painel administrativo.

Este script é uma FERRAMENTA DE PARTIDA, não uma dependência do sistema. Ele conversa com os
mesmos endpoints `/admin/*` que o painel usa, então cada produto criado aqui nasce um registro
comum — depois de rodar, o script pode ser apagado que nada muda: a administradora edita,
publica e exclui tudo normalmente pelo painel.

Duas escolhas propositais:

* **preço 0,00 e status INATIVO.** O material de origem não traz os preços de venda. Em vez de
  inventar um valor, o produto entra oculto: assim nenhum cliente vê "R$ 0,00" enquanto os
  preços reais não forem preenchidos no painel.
* **idempotente.** Rodar duas vezes não duplica nada — referências já cadastradas são puladas.
  Isso permite reexecutar depois de corrigir um dado sem limpar o banco antes.

Uso:
    python importar_catalogo.py --email admin@... --senha ... [--limite N] [--api URL]

    --limite N   cadastra apenas os N primeiros produtos (para um teste controlado)
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
DADOS = os.path.join(AQUI, "catalogo.json")

# O material de origem não traz preço de venda; ver docstring do módulo.
PRECO_INICIAL = "0.00"
STATUS_INICIAL = "INATIVO"


class Api:
    def __init__(self, base, token=None):
        self.base, self.token = base.rstrip("/"), token

    def _chamar(self, metodo, caminho, corpo=None):
        req = urllib.request.Request(self.base + caminho, method=metodo)
        req.add_header("Content-Type", "application/json")
        if self.token:
            req.add_header("Authorization", "Bearer " + self.token)
        dados = json.dumps(corpo).encode() if corpo is not None else None
        try:
            with urllib.request.urlopen(req, dados, timeout=60) as r:
                bruto = r.read().decode()
                return json.loads(bruto) if bruto else None
        except urllib.error.HTTPError as e:
            detalhe = e.read().decode(errors="replace")
            raise RuntimeError(f"{metodo} {caminho} -> HTTP {e.code}: {detalhe}") from None

    get = lambda self, c: Api._chamar(self, "GET", c)
    post = lambda self, c, b: Api._chamar(self, "POST", c, b)
    patch = lambda self, c, b: Api._chamar(self, "PATCH", c, b)


def entrar(base, email, senha):
    resposta = Api(base).post("/auth/login", {"email": email, "senha": senha})
    token = resposta.get("token")
    if not token:
        sys.exit("Login não retornou token. Confira e-mail e senha.")
    return token


def garantir_tamanhos(api, necessarios):
    """Cria os tamanhos que ainda não existem. Nunca mexe nos que já estão lá."""
    atuais = {t["nome"]: t["id"] for t in api.get("/admin/tamanhos")}
    for nome in necessarios:
        if nome in atuais:
            print(f"  = tamanho já existia: {nome}")
            continue
        criado = api.post("/admin/tamanhos", {"nome": nome, "ativo": True})
        atuais[nome] = criado["id"]
        print(f"  + tamanho criado: {nome} (id {criado['id']})")
    return atuais


def garantir_categorias(api, nomes):
    atuais = {c["nome"]: c["id"] for c in api.get("/admin/categorias")}
    for nome in nomes:
        if nome in atuais:
            print(f"  = categoria já existia: {nome}")
            continue
        criada = api.post("/admin/categorias", {"nome": nome, "ativo": True})
        atuais[nome] = criada["id"]
        print(f"  + categoria criada: {nome} (id {criada['id']})")
    return atuais


def descrever(produto):
    """Monta a descrição a partir do que o material realmente informa — sem completar lacunas."""
    partes = []
    if produto.get("tecido"):
        partes.append(f"Tecido: {produto['tecido']}.")
    if produto["tamanhos"]:
        partes.append("Tamanhos: " + ", ".join(produto["tamanhos"]) + ".")
    return " ".join(partes) or None


def importar(api, dados, mapa_categorias, mapa_tamanhos, limite=None):
    existentes = {}
    pagina, total_paginas = 0, 1
    while pagina < total_paginas:
        resp = api.get(f"/admin/produtos?page={pagina}&size=100&incluirExcluidos=true")
        for p in resp["content"]:
            existentes[p["referencia"]] = p["id"]
        total_paginas, pagina = resp["totalPages"] or 1, pagina + 1

    produtos = dados["produtos"][:limite] if limite else dados["produtos"]
    criados, pulados, falhas = [], [], []

    for prod in produtos:
        ref = prod["referencia"]
        if ref in existentes:
            pulados.append(ref)
            print(f"  = [{prod['ordem']:>2}] {ref} já cadastrado (id {existentes[ref]})")
            continue

        corpo = {
            "nome": prod["nome"],
            "referencia": ref,
            "descricao": descrever(prod),
            "preco": PRECO_INICIAL,
            "categoriaId": mapa_categorias[prod["categoria"]],
            "tecido": prod["tecido"],
            "sexo": prod["sexo"],
            "status": STATUS_INICIAL,
            "observacoes": prod.get("observacoes"),
            "destaque": False,
            "lancamento": False,
            "tamanhoIds": [mapa_tamanhos[t] for t in prod["tamanhos"]],
        }
        try:
            novo = api.post("/admin/produtos", corpo)
            criados.append((prod, novo["id"]))
            print(f"  + [{prod['ordem']:>2}] {ref} {prod['nome'][:44]}")
        except RuntimeError as erro:
            falhas.append((ref, str(erro)))
            print(f"  ! [{prod['ordem']:>2}] {ref} FALHOU: {erro}")

    return criados, pulados, falhas


def aplicar_ordem(api, dados):
    """Grava o campo `ordem` na sequência do material comercial (1..N).

    Precisa ser um passo separado porque o endpoint de criação não aceita `ordem` — no painel,
    quem define a posição é o arrastar-e-soltar, que chama justamente este endpoint.
    """
    por_ref = {}
    pagina, total_paginas = 0, 1
    while pagina < total_paginas:
        resp = api.get(f"/admin/produtos?page={pagina}&size=100&incluirExcluidos=true")
        for p in resp["content"]:
            por_ref[p["referencia"]] = p["id"]
        total_paginas, pagina = resp["totalPages"] or 1, pagina + 1

    itens = [{"id": por_ref[p["referencia"]], "ordem": p["ordem"]}
             for p in dados["produtos"] if p["referencia"] in por_ref]
    api.patch("/admin/produtos/reordenar", itens)
    return len(itens)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://localhost:8080/api/v1")
    ap.add_argument("--email", required=True)
    ap.add_argument("--senha", required=True)
    ap.add_argument("--limite", type=int, default=None)
    args = ap.parse_args()

    dados = json.load(open(DADOS, encoding="utf-8"))
    api = Api(args.api, entrar(args.api, args.email, args.senha))

    print("\n== tamanhos ==")
    tamanhos = garantir_tamanhos(api, dados["tamanhos_necessarios"])
    print("\n== categorias ==")
    categorias = garantir_categorias(api, dados["categorias"])
    print(f"\n== produtos{' (limite ' + str(args.limite) + ')' if args.limite else ''} ==")
    criados, pulados, falhas = importar(api, dados, categorias, tamanhos, args.limite)
    print("\n== ordem ==")
    print(f"  {aplicar_ordem(api, dados)} produtos posicionados na sequência do catálogo")

    print(f"\nresumo: {len(criados)} criados | {len(pulados)} já existiam | {len(falhas)} falharam")
    for ref, erro in falhas:
        print(f"  FALHA {ref}: {erro}")
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main())
