# -*- coding: utf-8 -*-
"""Confere, produto a produto, se o que está no banco corresponde ao catálogo de origem.

Roda depois de `importar_catalogo.py`. Não altera nada — só lê pela API e compara campo a
campo. Serve para provar que a importação não silenciou nenhum erro e pode ser reexecutado
sempre que houver dúvida sobre a integridade do catálogo.

Uso:
    python conferir_catalogo.py --email admin@... --senha ...
"""
import argparse
import json
import os
import sys

from importar_catalogo import Api, entrar

AQUI = os.path.dirname(os.path.abspath(__file__))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://localhost:8080/api/v1")
    ap.add_argument("--email", required=True)
    ap.add_argument("--senha", required=True)
    ap.add_argument("--detalhe", action="store_true", help="lista cada produto conferido")
    args = ap.parse_args()

    dados = json.load(open(os.path.join(AQUI, "catalogo.json"), encoding="utf-8"))
    api = Api(args.api, entrar(args.api, args.email, args.senha))

    # A listagem já vem ordenada por `ordem` — guardamos a sequência para conferir o
    # posicionamento sem depender de um campo que a API não expõe.
    no_banco, sequencia, pagina, total_paginas = {}, [], 0, 1
    while pagina < total_paginas:
        resp = api.get(f"/admin/produtos?page={pagina}&size=100&incluirExcluidos=true")
        for p in resp["content"]:
            no_banco[p["referencia"]] = p
            sequencia.append(p["referencia"])
        total_paginas, pagina = resp["totalPages"] or 1, pagina + 1

    problemas, conferidos = [], 0
    for esperado in dados["produtos"]:
        ref = esperado["referencia"]
        resumo = no_banco.get(ref)
        if not resumo:
            problemas.append(f"{ref}: NÃO ESTÁ NO BANCO")
            continue

        p = api.get(f"/admin/produtos/{resumo['id']}")
        erros = []
        if p["nome"] != esperado["nome"]:
            erros.append(f"nome {p['nome']!r} != {esperado['nome']!r}")
        if p["categoria"]["nome"] != esperado["categoria"]:
            erros.append(f"categoria {p['categoria']['nome']!r} != {esperado['categoria']!r}")
        if p["sexo"] != esperado["sexo"]:
            erros.append(f"sexo {p['sexo']} != {esperado['sexo']}")
        # A API omite campos nulos do JSON, então campos opcionais são lidos com .get().
        if (p.get("tecido") or None) != (esperado["tecido"] or None):
            erros.append(f"tecido {p.get('tecido')!r} != {esperado['tecido']!r}")
        if p["status"] != "INATIVO":
            erros.append(f"status {p['status']} (esperado INATIVO)")
        if float(p["preco"]) != 0.0:
            erros.append(f"preço {p['preco']} (esperado 0.00)")
        if p.get("destaque"):
            erros.append("marcado como destaque")
        tam_banco = sorted(t["nome"] for t in p.get("tamanhosDisponiveis") or [])
        if tam_banco != sorted(esperado["tamanhos"]):
            erros.append(f"tamanhos {tam_banco} != {sorted(esperado['tamanhos'])}")
        if esperado.get("observacoes") and p.get("observacoes") != esperado["observacoes"]:
            erros.append(f"observações {p.get('observacoes')!r}")

        conferidos += 1
        if erros:
            problemas.append(f"{ref}: " + "; ".join(erros))
            print(f"  XX [{esperado['ordem']:>2}] {ref}: {'; '.join(erros)}")
        elif args.detalhe:
            print(f"  OK [{esperado['ordem']:>2}] {ref} {esperado['nome'][:44]}")

    refs_esperadas = {p["referencia"] for p in dados["produtos"]}
    sobrando = set(no_banco) - refs_esperadas

    esperada = [p["referencia"] for p in sorted(dados["produtos"], key=lambda x: x["ordem"])]
    if sequencia != esperada:
        divergentes = [(i + 1, e, a) for i, (e, a) in enumerate(zip(esperada, sequencia)) if e != a]
        problemas.append(f"ordem fora de sequência em {len(divergentes)} posições: {divergentes[:5]}")

    print(f"\nconferidos            : {conferidos}/{len(dados['produtos'])}")
    print(f"referências no banco  : {len(no_banco)}")
    print(f"sequência de exibição : {'confere com o catálogo' if sequencia == esperada else 'DIVERGENTE'}")
    print(f"duplicadas            : {'nenhuma' if len(no_banco) == len(sequencia) else 'HÁ DUPLICADAS'}")
    print(f"fora do catálogo      : {sorted(sobrando) or 'nenhuma'}")
    print(f"divergências          : {len(problemas)}")
    for p in problemas:
        print("  -", p)
    return 1 if problemas or sobrando else 0


if __name__ == "__main__":
    sys.exit(main())
