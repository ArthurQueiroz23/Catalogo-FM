# Progresso do Projeto — Fruto da Malha Catálogo

> **Leia este arquivo primeiro em toda nova sessão.** Ele é a fonte da verdade sobre onde o
> projeto parou. Depois de ler, confira também `docs/ARCHITECTURE.md` (decisões técnicas),
> `docs/DATABASE_SCHEMA.md` (modelo de dados) e `docs/API_CONTRACT.md` (contrato de endpoints).

Última atualização: **2026-08-05** — Sessão 2 (painel administrativo completo + correções).

---

## Etapa atual

O sistema está **funcionalmente completo de ponta a ponta**: site público (Sessão 1) + painel
administrativo completo (Sessão 2). Backend e frontend compilam e buildam sem erros, sem
warnings e sem vulnerabilidades conhecidas — verificado nesta sessão com as ferramentas reais
instaladas (ver abaixo). O que falta agora é sobretudo **testes automatizados, deploy e polimento
de design** — não há mais nenhuma funcionalidade central do produto pendente de implementação.

### ✅ Diferente da sessão 1: desta vez tudo foi de fato compilado, buildado e verificado

Na sessão 1 não havia Java/Maven/Node disponíveis no ambiente. Nesta sessão eles foram instalados
(ver `docs/ARCHITECTURE.md` se quiser saber onde/como) e usados para verificar tudo de verdade:

- `mvn clean test` (backend) → **sucesso, zero warnings** (não há testes escritos ainda, mas o
  projeto compila 100% limpo, inclusive com `-Xlint:all`).
- `npm run type-check` (frontend) → **zero erros de tipo**.
- `npm run lint` (frontend, ESLint 9 flat config) → **zero erros, zero warnings**.
- `npm run build` (frontend) → **build de produção completo com sucesso**, todas as 14 rotas
  (site público + painel administrativo).
- `npm audit` → **0 vulnerabilidades** (eram 5, incluindo 1 crítica no Next.js 14.2.15 — corrigido
  nesta sessão, ver changelog abaixo).

Isso não significa que o sistema foi testado *manualmente* no navegador com um banco de dados
real rodando (não havia Postgres disponível neste ambiente) — apenas que o código compila,
tipa e builda corretamente. **Primeiro passo recomendado da próxima sessão** (ou de quem for
revisar): seguir o `README.md` do zero num ambiente com Docker disponível e confirmar o fluxo
completo (login → cadastrar categoria → cadastrar produto → subir fotos → montar carrinho →
enviar pelo WhatsApp) funcionando de verdade num navegador.

---

## ⚠️ Instrução permanente do produto: sem controle de estoque, sem persistência de pedido

Reafirmado explicitamente nesta sessão (2026-08-05) — ver `docs/ARCHITECTURE.md` §5 para o
texto completo. Resumo: **não implementar, em nenhuma forma**, controle de estoque (quantidade
disponível, entrada/saída, reserva, baixa automática) nem persistência de pedidos (histórico de
vendas, entidades `Pedido`/`ItemPedido`). O catálogo assume disponibilidade ilimitada; o "pedido"
existe só como mensagem de WhatsApp, nunca gravado no backend. Se isso for pedido no futuro,
trate como uma decisão de produto nova a confirmar explicitamente — a orientação registrada é o
oposto.

---

## Changelog desta sessão (bugs corrigidos e refatorações)

Além de implementar o painel administrativo, esta sessão revisou o código da sessão 1 em busca
de bugs, seguindo a instrução explícita do usuário. Encontrados e corrigidos:

1. **Bug de compilação real**: `ProdutoMapper` ainda tinha `@Mapping(target = "slug", ignore =
   true)` sobrando de quando o campo `slug` existia em `Produto` (removido na sessão 1, mas o
   mapper não foi atualizado) — o backend **não compilava**. Corrigido.
2. **Vulnerabilidade crítica de segurança**: `next@14.2.15` tinha 1 CVE crítica (DoS) + várias
   altas (XSS, SSRF, cache poisoning). Atualizado para `next@16.3.0` + `react@19.2.8` — 0
   vulnerabilidades agora. Isso trouxe consigo a mudança de `params`/`searchParams` para `Promise`
   em Server e Client Components (Next 16), já aplicada em todas as páginas dinâmicas.
3. **Bug real de integração Cloudinary**: a validação `UploadSignatureRequest.folder` no backend
   só aceitava um segmento (`[a-zA-Z0-9_-]+`), mas o frontend precisa enviar caminhos aninhados
   tipo `produtos/000180` para organizar a galeria por produto — **todo upload de foto/vídeo de
   produto quebraria com 400**. Corrigido: regex passou a aceitar múltiplos segmentos, e o
   frontend sanitiza a referência antes de montar o caminho (referência é texto livre digitado
   pela administradora, pode ter espaços/símbolos que violariam a regex).
4. **Bug de validação client-side**: os schemas Zod de `preco` e `categoriaId` no formulário de
   produto aceitavam string vazia coagida para `0`/`positive()` falhando com mensagem genérica
   em vez de "campo obrigatório" — e pior, `preco` com `.min(0)` deixava passar um preço de
   R$ 0,00 vindo de um campo vazio. Corrigido para `.min(0.01, ...)` e `.min(1, ...)`.
5. **Gap de configuração real**: nada no projeto carregava o arquivo `backend/.env` — Spring Boot
   não lê `.env` nativamente, então `cp .env.example .env` não tinha efeito nenhum sem mais
   configuração. Corrigido adicionando `spring.config.import: optional:file:.env[.properties]`
   em `application.yml` (mecanismo nativo do Spring Boot, sem dependência extra) — **testado
   nesta sessão**, subindo o backend com um `.env` de teste e confirmando que ele passa da
   resolução de propriedades e só falha depois, ao tentar conectar no Postgres (prova de que o
   `.env` está sendo lido).
6. **`.gitignore` quebrado**: excluía `backend/.mvn/wrapper/maven-wrapper.jar` (justamente o
   arquivo que precisa ser versionado para o `./mvnw` funcionar sem Maven instalado) e tinha
   duas linhas `!**/src/main/**`/`!**/src/test/**` mortas (negavam um padrão que não existia).
   Corrigido.
7. **Maven Wrapper gerado**: `backend/mvnw`, `mvnw.cmd` e `.mvn/wrapper/` agora existem de
   verdade e foram testados (`./mvnw -v` funcionando) — na sessão 1 isso não tinha sido possível
   por falta de Maven no ambiente.
8. **Bug de robustez em segurança**: `JwtAuthenticationFilter` não tratava
   `UsernameNotFoundException` ao carregar o usuário do token — um JWT válido de um usuário já
   excluído do banco causaria 500 em vez de simplesmente seguir como não autenticado. Corrigido.
   Também removido um import morto (`WebAuthenticationDetailsSource`, nunca usado).
9. **Gap no tratamento de erros**: `GlobalExceptionHandler` não tinha handlers para
   `HttpMessageNotReadableException` (JSON mal formatado), `MethodArgumentTypeMismatchException`
   (ex.: `?sexo=XPTO`) nem `MissingServletRequestParameterException` — todos cairiam no handler
   genérico e virariam 500 em vez do 400 correto. Adicionados.
10. **Limpeza de configuração morta**: removido `spring.servlet.multipart` de `application.yml`
    (o backend nunca recebe upload de arquivo — arquitetura é upload direto ao Cloudinary — então
    esse limite nunca era usado) e o padrão `/v3/api-docs/**` do `SecurityConfig` (o path real do
    OpenAPI JSON foi customizado para `/api-docs`, então aquele padrão nunca era exercitado).
11. **Ecossistema atualizado com critério**: TypeScript, TailwindCSS, Zustand e ESLint foram
    atualizados para o último patch da mesma major que já estava em uso (não para as majors mais
    novas — TS 7, Tailwind 4, Zustand 5 — que exigiriam migrações não relacionadas à correção de
    segurança que motivou o upgrade; ver `docs/ARCHITECTURE.md` §3.6 para a tabela de versões e o
    racional completo dessa decisão).
12. **Migração de ESLint para flat config**: `.eslintrc.json` → `eslint.config.mjs` (exigência do
    `eslint-config-next@16`, que só suporta ESLint ≥ 9). Descoberta no processo: a forma
    documentada com `FlatCompat` quebra nesta versão do `eslint-config-next` com "Converting
    circular structure to JSON" — a forma que funciona é importar `eslint-config-next` diretamente
    (ele já exporta o array flat). Documentado em `docs/ARCHITECTURE.md` §3.6 para não perder essa
    descoberta de novo.
13. **Bug de hidratação SSR real**: `useCartStore.persist` fica `undefined` durante a
    pré-renderização estática no servidor (não há `localStorage` em Node.js) — o hook
    `useCartHasHydrated` acessava `.persist.hasHydrated()` sem optional chaining, e o build de
    produção **quebrava** ao tentar pré-renderizar `/carrinho`. Corrigido com `?.` e fallback
    seguro.
14. Dois ajustes para satisfazer o `eslint-plugin-react-hooks` v7 (regras novas,
    `set-state-in-effect` e `incompatible-library`): `CategoriaFormModal` trocou `watch()`/
    `setValue()` do react-hook-form por `<Controller>` (padrão mais idiomático, e `watch()`
    impede memoização do React Compiler); o guard de autenticação do layout do painel recebeu um
    comentário explicando por que o `setState` síncrono dentro do `useEffect` ali é
    intencional (é exatamente o mesmo motivo do caso do carrinho — evitar mismatch de
    hidratação — só que sem uma API de assinatura equivalente ao `onFinishHydration` disponível).

---

## O que já foi implementado

### Documentação (`docs/`)
- [x] `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_CONTRACT.md`, `PROGRESS.md` — todos
      atualizados nesta sessão para refletir o painel administrativo, as correções de bugs e o
      escopo explicitamente excluído (estoque/pedidos).
- [x] `README.md` — reescrito como tutorial completo para quem nunca programou (instalação de
      Java/Maven/Node/Git/Docker, clonar, abrir no VS Code, configurar `.env`, rodar backend e
      frontend, usar o painel, testar carrinho e WhatsApp, build de produção, erros comuns).

### Backend (`backend/`) — Spring Boot 3.3 / Java 21
Tudo da sessão 1 (ver histórico do arquivo, ou o resumo abaixo) **mais**, desta sessão:
- [x] Maven Wrapper (`mvnw`/`mvnw.cmd`/`.mvn/wrapper/`) gerado e testado.
- [x] `GlobalExceptionHandler` cobrindo `HttpMessageNotReadableException`,
      `MethodArgumentTypeMismatchException`, `MissingServletRequestParameterException`.
- [x] `.env` local carregado nativamente via `spring.config.import` — testado.
- [x] `UploadSignatureRequest.folder` aceita caminhos aninhados (`produtos/{referencia}`).
- [x] `JwtAuthenticationFilter` resiliente a usuário excluído com token ainda válido.
- [x] Todas as 9 correções de bugs/limpeza listadas no changelog acima.

Resumo do que já existia da sessão 1 (não mudou): entidades JPA completas, repositórios +
Specifications, JWT/segurança, CRUD completo de Categoria/Coleção/Tamanho/Produto (com galeria,
duplicar, ocultar, exclusão reversível), integração de assinatura Cloudinary, Dashboard, Swagger.
**Todos os endpoints documentados em `docs/API_CONTRACT.md` estão implementados.**

### Frontend (`frontend/`) — Next.js 16 (App Router) / React 19 / TypeScript / Tailwind

**Site público** (sessão 1, sem mudanças funcionais nesta sessão além do upgrade de Next.js):
Home, `/categoria`, `/categoria/[slug]`, `/produto/[referencia]`, `/busca`, `/carrinho` — ver
changelog para os dois bugs corrigidos (hidratação do carrinho, params assíncronos do Next 16).

**Painel administrativo — construído inteiro nesta sessão:**
- [x] `/admin/login` — formulário com react-hook-form + Zod, redireciona se já autenticado.
- [x] `/admin/(protegido)/layout.tsx` — guard de autenticação client-side, sidebar responsiva
      (colapsa em mobile), `<Toaster />` (sonner) para feedback de mutações.
- [x] `/admin` — Dashboard (totais de produtos/categorias, produtos recentes).
- [x] `/admin/categorias` — lista com drag-and-drop de ordem (`@dnd-kit`), modal de criar/editar
      com upload de imagem de capa, exclusão com confirmação.
- [x] `/admin/colecoes` — CRUD simples via modal (sem imagem/ordem, como no site público).
- [x] `/admin/tamanhos` — CRUD + drag-and-drop de ordem.
- [x] `/admin/produtos` — listagem com busca (debounced), filtros (categoria/sexo/status),
      paginação, ações rápidas por linha (editar, ocultar/ativar, duplicar, excluir).
- [x] `/admin/produtos/novo` e `/admin/produtos/[id]` — formulário completo (todos os campos,
      seleção múltipla de tamanhos como "pills" clicáveis) + `ProductGalleryManager` (upload de
      múltiplas fotos/vídeos com barra de progresso, reordenação por drag-and-drop, marcar
      imagem principal, exclusão) na tela de edição.

**Infraestrutura de dados do painel (nova nesta sessão):**
- [x] `src/lib/admin-api.ts` — uma função por endpoint administrativo, tipada, único lugar que
      conhece as rotas exatas.
- [x] `src/hooks/` — um hook React Query por recurso (`useCategorias`, `useColecoes`,
      `useTamanhos`, `useProdutos`, `useDashboard`, `useAuth`, `useUpload`, `useDebouncedValue`)
      + `query-keys.ts` centralizando chaves de cache.
- [x] `src/lib/cloudinary-upload.ts` — upload direto ao Cloudinary via `XMLHttpRequest` (para
      progresso), validação de arquivo (tipo/tamanho) e sanitização de nome de pasta.
- [x] `src/lib/schemas.ts` — schemas Zod (login, categoria, coleção, tamanho, produto).
- [x] `src/components/ui/` — 12 primitivos genéricos (Button, Input, Textarea, Select, Switch,
      Modal, ConfirmDialog, Badge, EmptyState, Pagination, Skeleton, QuantityStepper — este
      último reaproveitado do carrinho público).
- [x] `src/components/admin/` — 9 componentes específicos do painel (AdminSidebar, SortableList
      genérico, ProdutoForm, ProductGalleryManager, SingleImageUpload, TamanhoCheckboxGroup,
      StatCard, `*FormModal` de Categoria/Coleção/Tamanho).
- [x] Dependências novas: `react-hook-form`, `zod`, `@hookform/resolvers`, `@dnd-kit/*`, `sonner`.

---

## O que ainda falta implementar

### 1. Testes automatizados (nenhum existe ainda)
- [ ] Backend: testes de unidade dos services (JUnit 5 + Mockito) e de integração dos
      controllers (`@SpringBootTest` + `MockMvc`, idealmente com Testcontainers/Postgres real).
- [ ] Frontend: testes unitários de `lib/cart.ts`/`lib/whatsapp.ts` (funções puras, fáceis de
      testar) com Vitest; considerar Playwright para o fluxo
      "adicionar ao carrinho → finalizar pelo WhatsApp" e para o CRUD do painel mais adiante.

### 2. Verificação manual real (não foi possível nesta sessão)
- [ ] Rodar o projeto do zero seguindo o `README.md`, com Docker disponível, e confirmar no
      navegador: login, CRUD de categoria/coleção/tamanho, CRUD de produto, upload de foto/vídeo
      real no Cloudinary (precisa de uma conta Cloudinary de verdade), reordenação por
      drag-and-drop, carrinho, e o link do WhatsApp abrindo com a mensagem correta.
- [ ] Testar responsividade do painel administrativo em mobile de verdade (foi construído
      mobile-first com Tailwind, mas nunca visualizado num navegador real nesta sessão).

### 3. Deploy (nada foi configurado ainda)
- [ ] Criar banco na Neon, configurar variáveis de produção na Railway (backend) e na Vercel
      (frontend) — ver `docs/ARCHITECTURE.md` §4.
- [ ] Criar conta/credenciais reais do Cloudinary de produção.
- [ ] Definir e criar o primeiro usuário admin de produção (o `DevAdminInitializer` só roda em
      dev, de propósito — ver `docs/ARCHITECTURE.md` §2.7).
- [ ] Configurar domínio próprio apontando para a Vercel.

### 4. Pendências de design/produto (decisões que dependem do cliente)
- [ ] Paleta de cores e logo reais (hoje `tailwind.config.ts` usa uma paleta `brand`/`accent`
      provisória e o header mostra só texto).
- [ ] Imagem do banner da home (hoje é um gradiente com texto).
- [ ] Favicon e imagens de Open Graph.

### 5. Pequenos gaps conhecidos (não são bugs, são decisões de escopo)
- [ ] **Reordenação de produtos**: o backend tem o endpoint (`PATCH /admin/produtos/reordenar`)
      e o `ordem` já é respeitado na listagem pública, mas a tela `/admin/produtos` não tem
      drag-and-drop — combinar reorder + paginação + filtros de forma coerente foi
      deliberadamente adiado (ver decisão em `docs/ARCHITECTURE.md`, se for detalhar lá também).
      Categorias e Tamanhos já têm reorder completo, então o padrão (`SortableList`) já existe
      pronto para reaproveitar quando isso for priorizado.
- [ ] **Imagem de categoria órfã no Cloudinary**: `Categoria` só guarda `imagemUrl` (sem
      `publicId`), então trocar a imagem de capa não apaga o asset antigo no Cloudinary (fica
      órfão, consumindo cota, sem impacto funcional). Produtos não têm esse problema (imagens de
      produto guardam `publicId` e são apagadas corretamente). Resolver exigiria adicionar coluna
      + migration; adiado por ser um custo pequeno (storage) sem urgência.
- [ ] Filtros de busca pública (`/busca`, `/categoria/[slug]`) não expõem sexo/coleção na UI
      (o backend já suporta), só busca por texto.
- [ ] Sem paginação visível nas páginas públicas de listagem (`/categoria/[slug]`, `/busca`) —
      hoje busca até 48 produtos de uma vez; o componente `Pagination` já existe (usado no painel)
      e pode ser reaproveitado ali quando o catálogo crescer o suficiente para precisar.

### 6. Melhorias arquiteturais consideradas mas conscientemente adiadas
Ver `docs/ARCHITECTURE.md` §6 (multi-empresa/SaaS, favoritos, produtos relacionados, relatórios/
importação/exportação) — nenhuma implementada de propósito. **Não confundir com a seção §5 do
mesmo documento** (estoque e persistência de pedidos), que não é "adiada" — é excluída por
decisão de produto, não deve ser implementada sem confirmação explícita nova.

---

## Próximo passo recomendado

1. **Verificação manual real** (item 2 acima) — é o maior risco residual do projeto: o código
   compila e builda limpo, mas ainda não foi visto rodando num navegador de verdade com dados
   reais. Precisa de Docker (Postgres) e uma conta Cloudinary de teste.
2. Com o fluxo manual confirmado, corrigir qualquer problema de UX/comportamento encontrado
   (esperado que apareçam pequenos ajustes visuais — nenhuma tela deste painel foi vista
   renderizada de verdade ainda).
3. Testes automatizados (item 1) — pelo menos um smoke test de contexto do Spring Boot
   (`@SpringBootTest` com Testcontainers) e os testes unitários de `lib/cart.ts`/`whatsapp.ts`
   no frontend, que são baratos e de alto valor por serem lógica de negócio pura.
4. Deploy (item 3) — banco na Neon primeiro (é pré-requisito dos outros dois), depois backend na
   Railway, depois frontend na Vercel.
5. Pendências de design (item 4) — dependem de material da cliente (logo, paleta, fotos reais de
   produtos para o banner); podem rodar em paralelo com o deploy.
