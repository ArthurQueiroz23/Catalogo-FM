# Carga inicial do catálogo

Ferramentas de **partida** para popular o catálogo de uma vez, em vez de cadastrar peça por peça
no painel. Elas falam com os mesmos endpoints `/admin/*` que o painel usa, então cada produto
criado aqui nasce um registro comum do sistema.

> **Os produtos não dependem destes scripts.** Depois da carga, esta pasta inteira pode ser
> apagada que nada muda: editar, publicar, reordenar e excluir continuam funcionando pelo painel.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `catalogo.json` | Os dados das peças (referência, nome, categoria, tecido, tamanhos, sexo, ordem, fotos) |
| `importar_catalogo.py` | Cria tamanhos, categorias e produtos, e grava a ordem de exibição |
| `conferir_catalogo.py` | Lê o banco pela API e compara campo a campo com `catalogo.json` |
| `enviar_fotos.py` | Envia as fotos ao Cloudinary e associa cada uma ao seu produto |

As fotos ficam em `referencias/fotos-catalogo/`, fora do versionamento — mesma convenção do
material de referência da marca (ver `.gitignore`).

## Como rodar

Com o banco e o backend no ar:

```bash
cd scripts/catalogo

# 1. cadastra tamanhos, categorias e produtos
python importar_catalogo.py --email admin@frutodamalha.com.br --senha SUA_SENHA

# 2. confere que tudo entrou certo (não altera nada)
python conferir_catalogo.py --email admin@frutodamalha.com.br --senha SUA_SENHA --detalhe

# 3. envia as fotos — exige credenciais reais do Cloudinary (ver abaixo)
python enviar_fotos.py --email admin@frutodamalha.com.br --senha SUA_SENHA
```

Use `--limite N` em `importar_catalogo.py` e `enviar_fotos.py` para um teste com poucas peças
antes de rodar tudo.

Os três scripts são **idempotentes**: rodar de novo não duplica nada — referências já
cadastradas e galerias já preenchidas são puladas. Dá para reexecutar depois de corrigir um
dado sem precisar limpar o banco.

## Preço 0,00 e status oculto

As peças entram com **preço 0,00** e **status oculto**, de propósito: o material de origem não
traz os preços de venda, e inventar um valor seria pior do que não ter nenhum. Enquanto o preço
real não é preenchido no painel, a peça não aparece para o cliente.

O formulário do painel reforça isso: dá para salvar uma peça oculta com preço 0,00, mas **não**
dá para publicá-la sem informar o preço.

## Fotos: o que falta

`enviar_fotos.py` está pronto e testado até o ponto de contato com o Cloudinary, mas hoje para
com `401 Invalid api_key` porque `backend/.env` ainda tem os valores de exemplo:

```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

Para concluir esta etapa:

1. entre em https://cloudinary.com/console e copie **Cloud name**, **API Key** e **API Secret**;
2. substitua os três valores em `backend/.env`;
3. reinicie o backend (ele lê o `.env` só na inicialização);
4. rode `python enviar_fotos.py --limite 1 ...` e confira a peça no painel;
5. se estiver certo, rode sem `--limite` para enviar o restante.
