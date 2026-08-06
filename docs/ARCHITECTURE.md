# Arquitetura — Fruto da Malha Catálogo

Este documento registra **decisões** de arquitetura e o **porquê** de cada uma, para que qualquer
sessão futura de desenvolvimento mantenha consistência com o que já existe. Sempre que uma decisão
relevante mudar, atualize este arquivo.

---

## 1. Visão geral

Monorepo com dois aplicativos independentes que se comunicam via API REST:

```
Cliente (navegador) ──▶ Next.js (Vercel) ──▶ Spring Boot API (Railway) ──▶ PostgreSQL (Neon)
                                                        │
                                                        └──▶ Cloudinary (mídia)
```

- **Área pública** (`/`, `/produto/[referencia]`, `/categoria/[slug]`, `/busca`, `/selecao`): sem
  autenticação, consumida por qualquer cliente. Prioriza performance, SEO e responsividade.
- **Painel administrativo** (`/admin/**`): protegido por login (JWT), usado exclusivamente pela
  administradora da loja.
- **Sem checkout/pagamento.** A "seleção" apenas monta uma mensagem estruturada enviada via
  `wa.me` (WhatsApp) — toda a negociação segue fora do sistema.

> **Este sistema não é um e-commerce.** É um catálogo digital administrável que substitui o
> catálogo em PDF feito no Canva. O critério para aceitar qualquer funcionalidade nova é:
> *"isso ajuda a dona da loja a abandonar o Canva e a vender mais facilmente pelo WhatsApp?"*
> Se a resposta for não, a funcionalidade não pertence a este produto — por mais natural que ela
> pareça vinda de uma loja virtual. Ver §7 para as decisões já tomadas sob esse critério.

## 2. Backend — Spring Boot

### 2.1 Pacote raiz

```
com.frutodamalha.catalogo
```

### 2.2 Arquitetura em camadas

```
controller  → recebe HTTP, valida entrada (Bean Validation), nunca acessa repository diretamente
service     → regra de negócio, transações (@Transactional), orquestra repositories/mappers
mapper      → conversão Entity ↔ DTO (MapStruct) — nenhuma lógica de negócio aqui
repository  → Spring Data JPA + Specifications para filtros dinâmicos
domain      → entidades JPA (entity) e enums de domínio
dto         → request (entrada, validada) / response (saída) / common (paginação, erros)
security    → JWT, filtros, UserDetailsService
exception   → exceções de domínio + GlobalExceptionHandler (@RestControllerAdvice)
config      → beans de configuração (Security, CORS, OpenAPI, Cloudinary, Jackson)
specification → Specifications JPA reutilizáveis para busca/filtros dinâmicos
```

Regra de dependência: `controller → service → repository`. Uma camada nunca "pula" para a
camada de baixo (ex.: controller nunca injeta `Repository` diretamente). DTOs nunca vazam para
dentro do `domain`; entidades JPA nunca são serializadas diretamente na resposta HTTP.

### 2.3 Convenções de nomenclatura

| Elemento | Convenção | Exemplo |
|---|---|---|
| Entidade JPA | Substantivo, singular, PT-BR (domínio do negócio) | `Produto`, `Categoria` |
| Enum de domínio | Substantivo, PT-BR | `Sexo`, `StatusProduto` |
| Repository | `{Entidade}Repository` | `ProdutoRepository` |
| Service (interface) | `{Entidade}Service` | `ProdutoService` |
| Service (impl) | `{Entidade}ServiceImpl` | `ProdutoServiceImpl` |
| Controller | `{Entidade}Controller` | `ProdutoController` |
| Mapper | `{Entidade}Mapper` | `ProdutoMapper` |
| DTO de entrada (criar/editar) | `{Entidade}Request` | `ProdutoRequest` |
| DTO de saída completo | `{Entidade}Response` | `ProdutoResponse` |
| DTO de saída resumido (listagens) | `{Entidade}SummaryResponse` | `ProdutoSummaryResponse` |
| Exceção de domínio | `{Motivo}Exception` | `ResourceNotFoundException` |

Todo DTO é um **Java `record`** (imutável, Java 21) com Bean Validation nos `request`.
Toda entidade usa **Lombok** (`@Getter/@Setter/@NoArgsConstructor` — nunca `@Data` em entidades
JPA, para evitar `equals/hashCode`/`toString` problemáticos com proxies do Hibernate e relações
bidirecionais).

### 2.4 Identificadores

- Chave primária técnica: `Long` (auto increment / `IDENTITY`) — eficiente para índices e joins.
- Identificador público/humano de produto: campo `referencia` (string única, ex.: `000180`),
  usado nas URLs (`/produto/000180`), nas mensagens de WhatsApp e na busca. Categorias/coleções
  usam `slug` (string única, gerada a partir do nome) como identificador amigável de URL.
- Motivo: manter URLs estáveis e legíveis sem expor incrementalmente o total de registros como
  chave principal de navegação, e permitir que a administradora troque o "nome bonito" sem
  quebrar a URL do produto (a referência raramente muda).

### 2.5 Exclusão de produtos: soft delete

`Produto` possui `status` (`ATIVO`/`INATIVO`) para "ocultar" (reversível, controla visibilidade
pública) e `deletedAt` (timestamp nullable) para "excluir" (some de toda listagem, inclusive do
painel, mas o registro physical permanece no banco). Motivo: exclusão física é irreversível e, em
um catálogo real, é comum a administradora excluir por engano ou precisar recuperar um histórico
de produto (ex.: para duplicar uma peça de coleção passada). Todas as queries de listagem filtram
`deletedAt IS NULL` via Specification/`@Where` — nunca é preciso lembrar disso manualmente em cada
service.

### 2.6 Banco de dados e migrations

- **Flyway** é a fonte da verdade do schema (`ddl-auto: validate` em todos os perfis — o Hibernate
  nunca cria/altera tabelas sozinho, só valida que as entidades batem com o schema real). Isso
  evita divergência silenciosa entre entidades e banco em produção.
  Motivo: em um projeto que evolui em várias sessões/meses, migrations versionadas são a única
  forma segura de saber "o que mudou e quando" e de aplicar o mesmo schema em dev/Railway/Neon.
- Migrations em `backend/src/main/resources/db/migration`, nomeadas `V{n}__descricao.sql`.
- Nenhuma senha/segredo é inserido via migration versionada (ver `docs/PROGRESS.md` sobre criação
  do primeiro usuário admin).

### 2.7 Segurança

- Autenticação **stateless** via JWT (access token; sem sessão/cookie de servidor).
- `PasswordEncoder`: BCrypt.
- Endpoints públicos (catálogo, busca, categorias, coleções, produto por referência): `GET`
  liberado sem autenticação.
- Endpoints administrativos (`/api/v1/admin/**` e todo método `POST/PUT/PATCH/DELETE` fora do
  login): exigem `ROLE_ADMIN`.
- CORS restrito à origem do frontend (variável de ambiente `APP_CORS_ALLOWED_ORIGINS`).
- Estrutura de `Role` já prevista como enum extensível (`ADMIN` hoje; `VENDEDOR` no futuro —
  ver seção "Funcionalidades futuras").

### 2.8 Upload de mídia (Cloudinary)

Fluxo escolhido: **upload direto do navegador para o Cloudinary** (o backend nunca recebe o
binário da imagem/vídeo, evitando sobrecarregar a API e o Railway com tráfego de arquivos grandes).

1. Frontend (admin) pede ao backend uma **assinatura de upload** (`POST /api/v1/admin/uploads/signature`),
   informando `resourceType` (`image`/`video`) e `folder` (ex.: `categorias`, `produtos/000180`).
2. Backend gera assinatura HMAC com a *API secret* do Cloudinary (nunca exposta ao cliente) e
   devolve `{ signature, timestamp, apiKey, cloudName, folder }`. `resourceType` não faz parte
   dos parâmetros assinados (é só o segmento de URL do passo 3) — ver `CloudinaryService`.
3. Frontend faz upload direto para `https://api.cloudinary.com/v1_1/{cloud}/{resourceType}/upload`
   usando essa assinatura (`frontend/src/lib/cloudinary-upload.ts`).
4. Cloudinary retorna `secure_url` + `public_id`; o frontend envia só essas strings para o backend
   ao salvar/editar o produto (`ImagemProduto`/`VideoProduto`).
5. Ao excluir uma imagem/vídeo, o backend usa o `public_id` armazenado para apagar o asset no
   Cloudinary via API admin (evita mídia órfã consumindo cota de storage).

No banco, **somente URL + `public_id`** são persistidos — nunca o binário. `folder` aceita vários
segmentos separados por `/` (regex `[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*` em `UploadSignatureRequest`);
como a referência do produto é digitada livremente pela administradora, o frontend sanitiza esse
segmento (`sanitizarSegmentoPasta`) antes de montar o caminho, para nunca violar essa regex.

### 2.9 Busca e filtros

`ProdutoSpecification` (JPA Specifications) compõe dinamicamente filtros por `nome`,
`referencia`, `categoria`, `colecao`, `descricao`, `sexo`, `status`, `destaque`, `lancamento`.
Motivo: Specifications permitem combinar filtros opcionais sem explosão combinatória de métodos
`findBy...` no repository, e são reaproveitadas tanto pela busca pública quanto pelos filtros do
painel administrativo.

### 2.10 Tratamento de erros

`GlobalExceptionHandler` (`@RestControllerAdvice`) centraliza:
- `MethodArgumentNotValidException` → 400 com lista de campos inválidos.
- `HttpMessageNotReadableException` (JSON ausente/mal formatado) → 400.
- `MethodArgumentTypeMismatchException` (ex.: `?sexo=XPTO` num enum) → 400.
- `MissingServletRequestParameterException` → 400.
- `ResourceNotFoundException` (custom) → 404.
- `BusinessRuleException` (custom, ex.: referência duplicada) → 409/422.
- `BadCredentialsException`/`AuthenticationException` → 401.
- `AccessDeniedException` → 403.
- Fallback genérico → 500 (log completo no servidor, resposta genérica ao cliente — nunca
  vaza stacktrace para o front).

Todas as respostas de erro seguem o mesmo formato (`ApiErrorResponse`, ver `docs/API_CONTRACT.md`).

### 2.11 Documentação da API

`springdoc-openapi` gera Swagger UI (`/swagger-ui.html`) automaticamente a partir dos
controllers/DTOs anotados. Esquema `bearerAuth` (JWT) configurado globalmente para testar
endpoints protegidos direto pela UI.

---

## 3. Frontend — Next.js

### 3.1 App Router — estrutura de pastas

```
frontend/src/app/
├── (public)/                       # grupo de rotas da área pública (sem layout de admin)
│   ├── layout.tsx                  # Header + Footer + WhatsApp flutuante
│   ├── page.tsx                    # Home
│   ├── busca/page.tsx
│   ├── categoria/page.tsx          # índice de categorias
│   ├── categoria/[slug]/page.tsx
│   ├── produto/[referencia]/page.tsx
│   ├── selecao/page.tsx            # ex-"carrinho" (ver §7.1); /carrinho redireciona para cá
│   ├── not-found.tsx
│   └── error.tsx
├── admin/
│   ├── login/page.tsx              # FORA do grupo (protegido) — não herda o guard de auth
│   └── (protegido)/
│       ├── layout.tsx              # guard de auth (client-side) + sidebar + <Toaster />
│       ├── page.tsx                # só redireciona para /admin/produtos (ver §7.4)
│       ├── produtos/page.tsx       # listagem (busca, filtros, paginação, ações rápidas)
│       ├── produtos/novo/page.tsx
│       ├── produtos/[id]/page.tsx  # edição + galeria
│       ├── categorias/page.tsx
│       ├── colecoes/page.tsx
│       └── tamanhos/page.tsx
├── layout.tsx                      # layout raiz (fonte Inter, metadata/OG base, <Providers>)
├── providers.tsx
├── robots.ts                       # robots.txt gerado (bloqueia /admin, /busca, /selecao)
├── sitemap.ts                      # sitemap.xml gerado do catálogo real (revalidate 1h)
└── globals.css

frontend/src/
├── components/
│   ├── ui/            # primitivos genéricos (Button, Input, Select, Modal, Badge, Pagination...)
│   ├── admin/          # específicos do painel (AdminSidebar, SortableList, ProdutoForm,
│   │                    # ProductGalleryManager, *FormModal, StatCard...)
│   ├── product/         # ProductCard, ProductGrid, ProductGallery, ProductAddToCart
│   ├── category/        # CategoryCard
│   ├── cart/             # CartButton, CartItemRow
│   └── layout/           # Header, Footer, SearchBar, WhatsAppFloatingButton
├── hooks/                 # um arquivo por recurso (useCategorias, useProdutos, useAuth...)
│                           # + query-keys.ts centralizando chaves do React Query
├── lib/                    # api.ts, admin-api.ts, auth.ts, cart.ts, whatsapp.ts, format.ts,
│                            # config.ts, schemas.ts (Zod), cloudinary-upload.ts, paginacao.ts
├── store/                   # cart-store.ts (Zustand)
└── types/                    # api.ts (espelha DTOs do backend), cart.ts
```

Rotas públicas ficam no route group `(public)` para ter um layout visualmente distinto do
`/admin` sem afetar a URL. `/admin/login` fica **fora** do grupo `(protegido)` de propósito —
se estivesse dentro, herdaria o guard de autenticação e criaria um loop de redirecionamento.

### 3.2 Gerenciamento de estado

- **Estado de servidor no site público**: Server Components fazendo `fetch` direto (sem
  React Query) — simples, cacheável pelo Next.js, sem JS extra no cliente.
- **Estado de servidor no painel admin**: `@tanstack/react-query` (um hook por recurso em
  `src/hooks/`, todos passando por `src/lib/admin-api.ts`) — cache, invalidação automática após
  mutações e estados de loading/erro prontos para a UI.
- **Estado de carrinho** (client-only, por definição não é dado de servidor): `zustand` +
  persistência em `localStorage`, para o carrinho sobreviver a um refresh de página.
- **Formulários do painel**: `react-hook-form` + `zod` (`@hookform/resolvers/zod`) — validação
  client-side espelhando as regras do Bean Validation do backend (`src/lib/schemas.ts`), com
  `Controller` para campos de valor customizado (upload de imagem, seleção de tamanhos) em vez de
  `watch()`/`setValue()` manual — `watch()` impede a memoização do React Compiler e o eslint-plugin
  moderno já sinaliza isso.
- **Reordenação (drag-and-drop)**: `@dnd-kit` via o componente genérico
  `components/admin/SortableList.tsx`, reaproveitado em Categorias, Tamanhos e na galeria de
  Produtos.
- **Notificações**: `sonner` (`<Toaster />` no layout do painel) para feedback de sucesso/erro
  das mutações — só carregado na área admin, o site público não precisa disso.
- **Autenticação do admin**: token JWT em `localStorage` (`src/lib/auth.ts`) + header
  `Authorization: Bearer` anexado automaticamente pelo `api.ts` quando a chamada usa `auth: true`.
  Simples e suficiente para uma API stateless com um único papel (`ADMIN`); migrar para cookies
  httpOnly via Route Handler é uma evolução possível caso se decida reforçar a proteção contra XSS
  (ver `docs/PROGRESS.md`), mas não é o desenho atual.

### 3.3 Consistência "alteração aparece imediatamente"

Toda página pública é `export const dynamic = 'force-dynamic'` e faz `fetch` com
`cache: "no-store"`. Qualquer edição da administradora aparece no próximo carregamento, sem
invalidação manual, sem webhook, sem passo extra.

**Isto é requisito de produto, não uma etapa provisória.** A promessa central do sistema é
"salvou no painel, apareceu no site" — o que substitui o ciclo *editar no Canva → exportar PDF →
reenviar aos clientes*. Cachear as páginas públicas (ISR, `revalidate`, cache de borda) reintroduz
uma janela em que o catálogo público mostra dados velhos, que é exatamente o problema que o
sistema existe para eliminar. **Não migrar para ISR** sem uma decisão de produto explícita e nova.

Se um dia o volume de tráfego justificar cache, o caminho correto é invalidação sob demanda
(`revalidateTag` disparado pelo backend a cada mutação) — nunca revalidação por tempo. A única
rota cacheada hoje é `sitemap.xml` (`revalidate = 3600`), que não é vista por nenhum cliente.

### 3.4 Tipagem compartilhada

`frontend/src/types/api.ts` espelha manualmente os DTOs `Request`/`Response` do backend (não há
geração automática de client nesta fase). Qualquer mudança de DTO no backend **deve** ser
refletida manualmente nesse arquivo na mesma sessão de trabalho, para não haver dessincronia.
`src/lib/admin-api.ts` é o único lugar que conhece as rotas exatas (`/admin/categorias/{id}`
etc.) — os hooks em `src/hooks/` nunca montam URLs diretamente, só chamam essas funções.

### 3.5 Estilo visual

TailwindCSS com paleta e tokens centralizados em `tailwind.config.ts` (ver `docs/PROGRESS.md`
para a paleta de marca quando definida com o cliente). Mobile-first: todas as classes utilitárias
partem do layout mobile e usam prefixos (`sm:`, `md:`, `lg:`) para telas maiores.

### 3.6 SEO e compartilhamento

O catálogo é divulgado por um link único, compartilhado principalmente no WhatsApp e no Instagram.
Por isso:

- `metadataBase` no layout raiz vem de `NEXT_PUBLIC_SITE_URL` — sem ele, as URLs de Open Graph
  saem relativas e o preview do link compartilhado aparece **sem imagem**.
- A página do produto declara `openGraph.images` com a imagem principal da peça: quem compartilha
  um produto no WhatsApp vê a foto no preview.
- `app/sitemap.ts` monta o sitemap a partir do catálogo real (categorias ativas + todos os
  produtos ativos, paginando a API de 60 em 60). É a única rota com cache (`revalidate = 3600`),
  porque nenhum cliente a vê. Se a API estiver fora do ar durante o build, o sitemap cai para as
  rotas fixas em vez de quebrar o deploy.
- `app/robots.ts` bloqueia `/admin`, `/busca` e `/selecao` — o painel é privado, e busca/seleção
  geram URLs infinitas e equivalentes que competiriam com as páginas de categoria.
- As listagens públicas paginam por URL (`?page=`), com `<Link>` real e `rel="prev"/"next"`, para
  que o buscador consiga rastrear o catálogo inteiro (ver §7.5).

---

## 3.7 Versões principais (checadas em 2026-08-05)

| Pacote | Versão | Observação |
|---|---|---|
| Next.js | 16.3.0 | Turbopack por padrão; `params`/`searchParams` são `Promise` (ver abaixo) |
| React / react-dom | ^19.2.8 | exigido pelo Next 16 |
| TypeScript | ^5.9.3 | deliberadamente **não** foi para o TS 7 (major novo, sem relação com a
  correção de segurança que motivou o upgrade do Next — ver `docs/PROGRESS.md`) |
| TailwindCSS | ^3.4.19 | deliberadamente **não** foi para o Tailwind 4 (reescrita de config
  CSS-first — mesma lógica: não misturar com a correção de segurança) |
| zustand | ^4.5.7 | idem — v5 existe mas não foi adotada nesta sessão |
| @tanstack/react-query | ^5.101.4 | |
| ESLint | ^9.39.5 (flat config, `eslint.config.mjs`) | `eslint-config-next` exporta o array flat
  direto em `eslint-config-next/index.js` — **não** usar `FlatCompat`, que quebra com
  "Converting circular structure to JSON" nesta versão |
| Spring Boot | 3.3.4 | Java 21 |

**Next.js 16 — mudança que afeta todo código novo:** `params` e `searchParams` em `page.tsx`/
`generateMetadata` são `Promise` e precisam de `await` (Server Components) ou do hook `use()`/
`useParams()` (Client Components). Ver qualquer página em `app/(public)/produto/[referencia]/`
ou `app/admin/(protegido)/produtos/[id]/page.tsx` como referência do padrão já aplicado.

Antes de adicionar uma dependência nova ou atualizar uma existente, rode `npm view <pacote>
version` (ou `npm view <pacote>@<major> version` para o topo de uma major específica) em vez de
assumir uma versão de memória — o ecossistema JS muda rápido demais para confiar em treino do
modelo sem checar.

## 4. Ambientes e deploy

| Camada | Local (dev) | Produção |
|---|---|---|
| Frontend | `npm run dev` (localhost:3000) | Vercel |
| Backend | `./mvnw spring-boot:run` (perfil `dev`) | Railway (perfil `prod`) |
| Banco | Docker Postgres local | Neon PostgreSQL |
| Mídia | Cloudinary (mesma conta/pasta `dev/` vs `prod/`) | Cloudinary |

Variáveis sensíveis (JWT secret, credenciais Cloudinary, URL do banco) **nunca** são commitadas —
sempre via variáveis de ambiente (`.env` local ignorado pelo git; variáveis configuradas
diretamente no painel da Railway/Vercel em produção).

**Como o backend lê o `.env` local:** `application.yml` declara
`spring.config.import: optional:file:.env[.properties]` — o Spring Boot trata o `.env` como um
`application.properties` comum (sintaxe `CHAVE=valor` já é válida nos dois formatos). Isso é
nativo do Spring Boot (2.4+), sem precisar de nenhuma biblioteca de terceiros (`spring-dotenv` e
similares foram avaliados e descartados por incerteza de coordenadas Maven/versão — o mecanismo
nativo resolve o mesmo problema com zero dependência extra). Verificado nesta sessão subindo o
backend com um `.env` de teste: a aplicação passou da fase de resolução de propriedades
(`APP_JWT_SECRET`, credenciais Cloudinary) e só falhou depois, ao tentar abrir conexão real com
o Postgres — prova de que o carregamento do `.env` funciona de ponta a ponta.

## 5. Escopo explicitamente excluído (decisão de produto, não pendência técnica)

Estes itens **não devem ser implementados**, mesmo que pareçam extensões naturais do modelo —
foi uma decisão explícita do produto (reafirmada na sessão de 2026-08-05), não um esquecimento:

- **Controle de estoque** em qualquer forma: quantidade disponível, entrada/saída, movimentação,
  baixa automática ou reserva de produto. O catálogo assume disponibilidade ilimitada por design.
  `ProdutoTamanho.disponivel` representa apenas "este tamanho existe para este produto", nunca
  "há N unidades" — não adicionar uma coluna de quantidade a essa tabela.
- **Persistência de pedidos**: o "pedido" existe *apenas* como a mensagem de texto montada no
  frontend e enviada ao WhatsApp (`frontend/src/lib/whatsapp.ts`) — o backend nunca vê, recebe
  nem grava um pedido. Não criar entidades `Pedido`/`ItemPedido`, não logar pedidos, não guardar
  histórico de vendas. As quantidades escolhidas no carrinho existem só na memória/localStorage
  do navegador da cliente, exclusivamente para compor essa mensagem.

Se o cliente (a empresa Fruto da Malha) pedir uma dessas features no futuro, trate como uma
decisão de produto nova a ser confirmada explicitamente antes de implementar — não decida
sozinho, dado que a orientação registrada aqui é o oposto.

## 6. Funcionalidades futuras (já consideradas na arquitetura atual, sem contradizer a seção 5)

O schema e as camadas foram desenhados para que estas features sejam extensões, não reescritas:

- **Painel de vendedores / múltiplas empresas (SaaS)**: `Usuario.role` já é um enum extensível
  (`ADMIN` hoje). Para multi-tenant, o ponto de extensão natural é adicionar uma entidade `Empresa`
  e uma FK `empresaId` nas entidades de catálogo — adiado até haver necessidade real, para não
  complicar queries desde já.
- **Clientes favoritos / produtos favoritos**: exige entidade `Cliente` com conta própria (hoje
  não há cadastro de cliente, só admin). Adicionar `Cliente` + tabela `ProdutoFavorito` (M:N).
- **Produtos relacionados**: tabela de auto-relacionamento `Produto` ↔ `Produto` (M:N) ou por
  `categoria`/`colecao` compartilhada (heurística simples, sem nova tabela).
- **Relatórios / importação Excel / exportação PDF**: camada de serviço adicional
  (`RelatorioService`) que reaproveita as Specifications já existentes — não afeta o domínio.

Sempre que uma dessas features for implementada, mova o item desta lista para o changelog do
`docs/PROGRESS.md` com a data e o resumo do que foi feito.

## 7. Decisões de produto: o que foi simplificado por não ser um e-commerce (2026-08-06)

Uma revisão da sessão 3 procurou funcionalidades que existiam por inércia de e-commerce
tradicional, e não porque servem ao objetivo do produto. As decisões abaixo foram confirmadas
explicitamente com o dono do produto — **não desfazer sem uma nova decisão explícita.**

### 7.1 O "carrinho" virou "seleção"

A rota é `/selecao` (`/carrinho` redireciona permanentemente, via `next.config.mjs`) e a interface
fala em "Adicionar à seleção", "Minha seleção", "Enviar seleção pelo WhatsApp".

Motivo: o objeto nunca representou uma compra — não há checkout, pagamento nem pedido gravado
(§5). Com o nome "carrinho", a interface criava a expectativa de checkout e precisava desmentir-se
com um aviso de "sem pagamento pelo site" em três telas diferentes. Renomeado, os três avisos
deixaram de ser necessários e saíram.

**Escopo deliberado da mudança:** só o que a cliente vê. Os nomes internos (`cart-store.ts`,
`components/cart/`, `CartItem`, a chave `frutodamalha-carrinho` no localStorage) foram mantidos —
renomeá-los seria churn sem valor para ninguém.

**A persistência em `localStorage` fica.** A restrição do produto ("o carrinho não tem
persistência") se refere ao servidor: nada de pedido gravado, histórico ou cadastro de cliente.
No navegador, persistir é o que impede a cliente de perder a seleção ao alternar para o WhatsApp
e voltar — comportamento normal em celular, que é o dispositivo da maioria.

### 7.2 `lancamento` saiu da interface

A home tem uma única vitrine curada ("Produtos em destaque"). O switch "Lançamento" saiu do
formulário e a seção "Lançamentos" saiu da home.

Motivo: nada expirava o flag. Em poucos meses a home mostraria "Acabou de chegar" para peças
antigas, e a administradora teria de desmarcar produto por produto — trabalho recorrente que o
Canva não exigia. Dois eixos de curadoria manual é vocabulário de merchandising de e-commerce.

**A coluna `produto.lancamento`, o campo no DTO e o endpoint `GET /produtos/lancamentos`
continuam existindo e funcionando** — nenhuma migration foi feita, nenhum dado foi perdido, e o
valor atual de cada produto é preservado a cada edição. A decisão é reversível reintroduzindo o
`<Switch>` e a seção da home.

### 7.3 `observacoes` passou a aparecer no site

O campo era preenchido pela administradora e não era renderizado em lugar nenhum — a dica do
formulário inclusive prometia que ele apareceria na página do produto. Agora aparece de verdade,
abaixo da descrição, e a dica descreve o comportamento real.

### 7.4 O painel não tem dashboard

`/admin` redireciona para `/admin/produtos`, e "Dashboard" saiu da sidebar. A administradora entra
no painel para mexer em produtos, não para ver contagens; um dashboard de métricas é reflexo de
template de admin, não uma necessidade dela.

`GET /admin/dashboard`, o hook `useDashboard` e o componente `StatCard` continuam no código, sem
uso, para a decisão ser reversível a baixo custo.

### 7.5 As listagens públicas paginam de verdade

`/categoria/[slug]` e `/busca` pediam `size=48` sem paginar: a partir do 49º produto de uma
categoria, as peças ficavam **invisíveis no catálogo** e nada avisava a administradora. Num
sistema cujo propósito é nunca deixar um produto de fora, isso era o defeito mais sério do
projeto.

Agora paginam em 24 por página (`lib/paginacao.ts`), navegando por URL (`?page=`) com `<Link>`
renderizado no servidor — e não por "carregar mais" em JavaScript — justamente para que cada
página tenha URL própria e o catálogo inteiro seja rastreável (§3.6). O componente é
`ui/PaginationLinks.tsx`; `ui/Pagination.tsx` (por callback) continua sendo o do painel.
