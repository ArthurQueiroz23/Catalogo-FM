# Contrato de API — Fruto da Malha Catálogo

Base URL: `/api/v1`. Todas as respostas JSON. Autenticação via header `Authorization: Bearer {jwt}`
nos endpoints marcados 🔒. Erros seguem sempre o formato `ApiErrorResponse` (ver final do documento).

Este documento é o contrato entre backend e frontend — **qualquer mudança de assinatura precisa
ser refletida nos dois lados na mesma sessão de trabalho** (DTOs Java em `dto/response|request` e
tipos TS em `frontend/src/types/api.ts`).

Para o status de implementação de cada endpoint, veja `docs/PROGRESS.md`.

---

## Autenticação

### `POST /auth/login`
Request:
```json
{ "email": "admin@frutodamalha.com.br", "senha": "********" }
```
Response `200`:
```json
{ "token": "eyJhbGciOiJIUzI1NiJ9...", "tipo": "Bearer", "expiraEm": 1735689600000,
  "usuario": { "id": 1, "nome": "Administradora", "email": "admin@frutodamalha.com.br", "role": "ADMIN" } }
```
Erros: `401` credenciais inválidas.

---

## Categorias

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/categorias` | público | Lista categorias ativas, ordenadas por `ordem` |
| GET | `/categorias/{slug}` | público | Detalhe de uma categoria |
| GET | `/admin/categorias` | 🔒 | Lista todas (inclusive inativas), para o painel |
| POST | `/admin/categorias` | 🔒 | Cria categoria |
| PUT | `/admin/categorias/{id}` | 🔒 | Edita categoria |
| DELETE | `/admin/categorias/{id}` | 🔒 | Exclui categoria (bloqueia se houver produtos vinculados) |
| PATCH | `/admin/categorias/reordenar` | 🔒 | Body: `[{ "id": 1, "ordem": 0 }, ...]` |

`CategoriaResponse`:
```json
{ "id": 1, "nome": "Macacão Curto", "slug": "macacao-curto", "descricao": "...",
  "imagemUrl": "https://res.cloudinary.com/...", "ordem": 0, "ativo": true,
  "totalProdutos": 12 }
```

## Coleções

Mesmo padrão de Categorias (`/colecoes`, `/admin/colecoes`), sem `imagemUrl`/`ordem` de exibição
na home (coleção é um agrupador secundário, filtrável na busca, mas não navegado por card na home
nesta fase).

## Tamanhos

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/tamanhos` | público | Lista tamanhos ativos ordenados |
| GET | `/admin/tamanhos` | 🔒 | Lista todos |
| POST | `/admin/tamanhos` | 🔒 | Cria tamanho |
| PUT | `/admin/tamanhos/{id}` | 🔒 | Edita |
| DELETE | `/admin/tamanhos/{id}` | 🔒 | Exclui (bloqueia se em uso) |
| PATCH | `/admin/tamanhos/reordenar` | 🔒 | Body: `[{ "id": 1, "ordem": 0 }, ...]` |

---

## Produtos

### Público

| Método | Rota | Descrição |
|---|---|---|
| GET | `/produtos` | Lista paginada com filtros (ver query params abaixo) |
| GET | `/produtos/{referencia}` | Detalhe completo por referência |
| GET | `/produtos/destaques` | Produtos com `destaque=true` |
| GET | `/produtos/lancamentos` | Produtos com `lancamento=true` — **sem consumidor hoje** (ver `docs/ARCHITECTURE.md` §7.2) |

> `lancamento` continua no schema, no DTO e nesta API, mas deixou de ter controle no painel e
> seção na home. O endpoint segue funcionando; simplesmente nada o chama. Não removê-lo — a
> decisão é reversível de propósito.

Query params de `GET /produtos`:

| Param | Tipo | Descrição |
|---|---|---|
| `q` | string | Busca livre em nome, referência, descrição, categoria, coleção |
| `categoria` | string (slug) | Filtra por categoria |
| `colecao` | string (slug) | Filtra por coleção |
| `sexo` | `MENINO\|MENINA\|UNISSEX` | Filtra por sexo |
| `page`, `size`, `sort` | padrão Spring `Pageable` | Paginação (`size` padrão 20, máx. 60) |

`ProdutoSummaryResponse` (usado em listagens — mais leve, sem descrição completa/vídeos):
```json
{ "id": 10, "nome": "Macacão Curto Dino", "referencia": "000180",
  "preco": 45.90, "categoriaNome": "Macacão Curto", "imagemPrincipalUrl": "https://...",
  "status": "ATIVO", "destaque": false, "lancamento": true }
```
`status` é usado pelo painel (badge Ativo/Oculto na tabela); a área pública sempre filtra por
`status=ATIVO` no backend, então o campo é redundante ali mas mantido por ser o mesmo DTO.

`ProdutoResponse` (detalhe completo):
```json
{
  "id": 10, "nome": "Macacão Curto Dino", "referencia": "000180",
  "descricao": "Macacão curto em malha 100% algodão...", "preco": 45.90,
  "categoria": { "id": 1, "nome": "Macacão Curto", "slug": "macacao-curto" },
  "colecao": { "id": 3, "nome": "Verão 2026", "slug": "verao-2026" },
  "tecido": "Malha 100% algodão", "sexo": "UNISSEX", "status": "ATIVO",
  "observacoes": "Peça com estampa exclusiva", "destaque": false, "lancamento": true,
  "tamanhosDisponiveis": [{ "id": 1, "nome": "P" }, { "id": 2, "nome": "M" }, { "id": 3, "nome": "G" }],
  "imagens": [{ "id": 1, "url": "https://...", "principal": true, "ordem": 0 }],
  "videos": [{ "id": 1, "url": "https://...", "ordem": 0 }]
}
```

### Administração (todas 🔒, prefixo `/admin`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/produtos` | Lista todos (inclusive ocultos/excluídos se `incluirExcluidos=true`), com filtros + busca |
| GET | `/admin/produtos/{id}` | Detalhe por id (edição) |
| POST | `/admin/produtos` | Cria produto |
| PUT | `/admin/produtos/{id}` | Edita produto |
| DELETE | `/admin/produtos/{id}` | Exclui (soft delete) |
| PATCH | `/admin/produtos/{id}/status` | Body `{ "status": "ATIVO\|INATIVO" }` — ocultar/ativar |
| POST | `/admin/produtos/{id}/duplicar` | Duplica produto (nova referência gerada, status `INATIVO`) |
| PATCH | `/admin/produtos/reordenar` | Body: `[{ "id": 10, "ordem": 0 }, ...]` |
| POST | `/admin/produtos/{id}/imagens` | Adiciona imagem `{ "url", "publicId" }` |
| DELETE | `/admin/produtos/{produtoId}/imagens/{imagemId}` | Remove imagem (e do Cloudinary) |
| PATCH | `/admin/produtos/{produtoId}/imagens/{imagemId}/principal` | Marca como principal |
| PATCH | `/admin/produtos/{produtoId}/imagens/reordenar` | Reordena galeria |
| POST | `/admin/produtos/{id}/videos` | Adiciona vídeo `{ "url", "publicId" }` |
| DELETE | `/admin/produtos/{produtoId}/videos/{videoId}` | Remove vídeo |

`ProdutoRequest`:
```json
{
  "nome": "Macacão Curto Dino", "referencia": "000180", "descricao": "...",
  "preco": 45.90, "categoriaId": 1, "colecaoId": 3, "tecido": "Malha 100% algodão",
  "sexo": "UNISSEX", "status": "ATIVO", "observacoes": "...", "destaque": false,
  "lancamento": true, "tamanhoIds": [1, 2, 3]
}
```

---

## Uploads (Cloudinary)

### `POST /admin/uploads/signature` 🔒
Request: `{ "resourceType": "image" | "video", "folder": "categorias" }`

`folder` aceita um ou mais segmentos separados por `/` — cada segmento só letras, números,
hífen ou underscore (regex `[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*`, validado em
`UploadSignatureRequest`). Usado hoje como `"categorias"` (capa de categoria) e
`"produtos/{referencia-sanitizada}"` (galeria de um produto — o frontend sanitiza a referência
antes de montar o caminho, já que ela é digitada livremente pela administradora; ver
`frontend/src/lib/cloudinary-upload.ts#sanitizarSegmentoPasta`).

Response `200`:
```json
{ "signature": "a1b2c3...", "timestamp": 1735689600, "apiKey": "123456789012345",
  "cloudName": "frutodamalha", "folder": "frutodamalha/produtos/000180" }
```
O frontend usa esses dados para fazer o upload direto ao Cloudinary (o backend nunca recebe o
arquivo). Ver `docs/ARCHITECTURE.md` §2.8.

---

## Dashboard

### `GET /admin/dashboard` 🔒
```json
{ "totalProdutos": 128, "totalProdutosAtivos": 120, "totalProdutosOcultos": 8,
  "totalCategorias": 14, "totalColecoes": 5,
  "produtosRecentes": [ /* ProdutoSummaryResponse[] */ ] }
```
**Sem consumidor hoje**: o painel não tem mais tela de dashboard — `/admin` vai direto para
`/admin/produtos` (ver `docs/ARCHITECTURE.md` §7.4). O endpoint segue implementado e funcional.

---

## Formato padrão de página (`PageResponse<T>`)

```json
{ "content": [ /* T[] */ ], "page": 0, "size": 20, "totalElements": 128, "totalPages": 7,
  "first": true, "last": false }
```

## Formato padrão de erro (`ApiErrorResponse`)

```json
{
  "timestamp": "2026-08-05T14:30:00Z", "status": 400, "erro": "Erro de validação",
  "mensagem": "Um ou mais campos são inválidos",
  "path": "/api/v1/admin/produtos",
  "campos": [ { "campo": "referencia", "mensagem": "já está em uso" } ]
}
```
`campos` só aparece em erros de validação (400); demais erros omitem esse campo.
