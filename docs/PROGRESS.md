# Progresso do Projeto — Fruto da Malha Catálogo

> **Leia este arquivo primeiro em toda nova sessão.** Ele é a fonte da verdade sobre onde o
> projeto parou. Depois de ler, confira também `docs/ARCHITECTURE.md` (decisões técnicas),
> `docs/DATABASE_SCHEMA.md` (modelo de dados) e `docs/API_CONTRACT.md` (contrato de endpoints).

Última atualização: **2026-08-10** — Sessão 5 (preparação do ambiente de produção).

---

## Changelog da sessão 5 (2026-08-10) — preparação para o deploy

Objetivo: sair do "abrir três terminais no PowerShell" para URLs permanentes na internet.
A arquitetura já documentada (Vercel + Railway + Neon + Cloudinary) foi auditada e **mantida** —
não houve redesenho.

📖 **[`docs/DEPLOY.md`](DEPLOY.md) é o documento novo desta sessão**: o passo a passo operacional
para publicar e manter o sistema no ar.

### Três bloqueadores encontrados na auditoria

1. **Não havia como criar o primeiro administrador em produção.** O perfil `prod` desligava o
   inicializador de admin e não oferecia alternativa: o deploy subiria com o banco vazio e
   **login impossível** (não há tela de cadastro, por design).
2. **`spring-boot-starter-actuator` não estava no `pom.xml`**, embora `application.yml` e
   `SecurityConfig` já referenciassem `/actuator/health`. O health check da hospedagem apontaria
   para um 404 e o serviço seria marcado como morto em laço.
3. **Nenhum arquivo de build para a Railway.**

### O que mudou

- **`AdminBootstrapInitializer`** substitui o antigo `DevAdminInitializer`, servindo dev e
  produção. Duas classes capazes de criar administradores seriam uma armadilha de segurança.
  Regras: só age com o banco sem nenhum usuário; **nunca sobrescreve um admin existente**; e fora
  do perfil `dev` exige senha de 12+ caracteres, **derrubando a aplicação** se for menor — é
  preferível o deploy falhar visivelmente a publicar um painel com senha adivinhável.
- **`Dockerfile`** multi-stage + `.dockerignore` + `railway.json` com o health check no caminho
  correto (`/api/v1/actuator/health` — o context-path é fácil de esquecer aqui).
- **CORS** passou a aceitar múltiplas origens e o curinga dos previews da Vercel, e a aplicação
  **recusa subir** se a variável estiver vazia ou contiver `*`.
- **Pool de conexões ajustado para a Neon**, que suspende o banco após ~5 min ocioso e encerra
  conexões paradas. Sem isso, o primeiro acesso do dia falharia em vez de apenas demorar.
- **O health check não depende do banco**: com a Neon suspensa, o probe falharia e a plataforma
  reiniciaria um contêiner saudável em laço.
- **O build do frontend agora falha** se `NEXT_PUBLIC_API_URL` ou `NEXT_PUBLIC_SITE_URL`
  faltarem. Antes caíam para `localhost`: o deploy subia "com sucesso" e quebrava só no navegador
  da cliente, longe da causa.

### Verificação feita (contêiner real, perfil `prod`)

Imagem construída e executada contra um Postgres limpo. Confirmado: health check `UP`; CORS
aceitando origem exata e preview, **bloqueando origem não autorizada (403)**; senha fraca e
bootstrap sem credenciais **derrubando a aplicação**; segunda subida com credenciais diferentes
**não** criando usuário novo nem trocando a senha do admin existente; catálogo público aberto sem
token (200) e painel protegido (401 sem token, 200 com token válido); e o fluxo completo
**admin cria produto → catálogo público mostra → admin muda o preço → o novo preço aparece →
admin oculta → some do site mas continua no painel**.

### Ressalva sobre o que "BUILD SUCCESS" significa neste projeto

O backend não tem nenhum teste automatizado — isso já constava em "O que ainda falta implementar"
§1, mas vale explicitar aqui: sessões anteriores citaram `mvn clean test → BUILD SUCCESS` ao
relatar verificações. É verdade, e **não significa nada**, porque `src/test` está vazio e não há
o que executar. Ao ler os relatos antigos, trate `BUILD SUCCESS` como "compila", nunca como
"testado".

A verificação desta sessão foi feita de outro jeito, justamente por isso: exercitando a API real
dentro do contêiner com `curl`, incluindo os casos de falha.

---

## Changelog da sessão 4 (2026-08-07) — redesign visual

O frontend estava tecnicamente bem construído e **visualmente anônimo**: podia ser o site de
qualquer loja. Esta sessão trocou isso pela identidade real da Fruto da Malha, extraída do
catálogo oficial em PDF (`referencias/TABELA 0 2025 .pdf` — 96 páginas feitas no Canva, o
material que este sistema existe para substituir).

📖 **`docs/DESIGN_SYSTEM.md` é o documento novo e principal desta sessão.** Ele registra os
valores medidos do PDF, os assets extraídos e — o mais importante — os pontos em que a web
precisou divergir do impresso, com o motivo de cada um.

### Análise (todas as 96 páginas, não uma amostra)

- PDF renderizado página a página e revisado em folhas de contato; fontes e cores extraídas das
  entranhas do arquivo (PyMuPDF), não estimadas a olho.
- Fontes do impresso: `Ballpoint-Regular` (8.020 chars), `BryndanWrite`, `Montserrat` (só os
  contatos da p.2). Cores: `#FFA85A` coral (97% do texto), `#FFFBEF` creme, `#755A49` marrom,
  `#297F02` verde.

### A divergência mais importante

**O coral da marca `#FFA85A` tem contraste 1,85:1 sobre o creme** — ilegível como texto na web e
reprovação grave de acessibilidade. No PDF ele carrega 97% do texto, mas lá é impressão a 24pt.
Solução: o coral virou **cor de preenchimento** (botão coral + tinta escura = 6,81:1) e o texto
usa o **marrom `#755A49` que já existe no PDF**, na assinatura "Vestindo carinho" (6,12:1).
A marca continua dominante — só mudou de papel.

### Assets extraídos do próprio PDF

- **Logo oficial** (`public/marca/logo.png`) — precisou aplicar o SMask para recuperar a
  transparência e **descartar a marca d'água "BAZAART"** que o app de recorte da loja deixou.
- **Padrão de rabiscos** (`rabiscos.webp`, **12 KB**) — a página 6 tinha o padrão como imagem
  única; espelhado nos dois eixos para repetir sem costura.
- **Favicon/ícone de app** — antes a aba do navegador mostrava o globo padrão.

### O que mudou no código

- `tailwind.config.ts` e `globals.css` reescritos: tokens de cor, três degraus de raio com
  significado (`pilula` para controles, `peca` para superfícies grandes, `2xl` para pequenas),
  sombras em marrom translúcido, fundo com o ladrilho de rabiscos.
- **Tipografia manuscrita em todo o site** (Shantell Sans, variável) — decisão de produto pela
  fidelidade ao catálogo; escolhida a única manuscrita do Google Fonts desenhada para interface.
- Todas as telas públicas e do painel migradas. **Zero resquício da paleta antiga** (verificado
  por varredura: nenhum `gray-*`, `brand-*`, `accent-*`, `bg-white`).
- **Um único sistema de botão**: `.btn-primary`/`.btn-secondary` e as variantes do `<Button>`
  passaram a ser as mesmas classes — antes eram duas implementações com tamanhos diferentes para
  a mesma função. `Input`/`Select`/`Textarea` passaram a compartilhar `classesCampo()`.
- **Alvos de toque de 44px** em todo controle (WCAG 2.2 / Apple HIG). O `QuantityStepper`, que é
  *a* interação do catálogo num público majoritariamente mobile, tinha 32px.
- **Foco visível único** (`.foco-marca`) — antes havia dois modelos concorrentes.
- `prefers-reduced-motion` desliga as animações de entrada.
- Rodapé passou a reproduzir a página de contato do catálogo (p.2), com os contatos reais vindos
  de variáveis de ambiente novas: `NEXT_PUBLIC_EMAIL`, `NEXT_PUBLIC_TELEFONE`,
  `NEXT_PUBLIC_ENDERECO`.

### Galeria do painel

A maior parte do que foi pedido **já existia** (fotos e vídeos ilimitados, reordenar arrastando,
definir capa, remover a qualquer momento, barra de progresso, carrossel público com swipe).
Foi adicionado o que faltava:

- **arrastar arquivos do computador direto para a área** (antes só clicando);
- **um botão único "Adicionar mídia"** que aceita fotos e vídeos juntos — o tipo de cada arquivo
  decide sozinho o destino, sem a administradora escolher antes;
- vídeos com `playsInline`/`preload="metadata"` também no painel.

---

---

## Etapa atual

O sistema está **funcionalmente completo de ponta a ponta**: site público (Sessão 1) + painel
administrativo completo (Sessão 2) + alinhamento de produto e correções (Sessão 3). Backend e
frontend compilam e buildam sem erros, sem warnings e sem vulnerabilidades conhecidas. O que falta
agora é **testes automatizados, deploy, verificação manual real e identidade visual** — não há
nenhuma funcionalidade central do produto pendente de implementação.

### O que a sessão 3 mudou, em uma frase

O sistema funcionava, mas em vários pontos ainda se comportava como uma loja virtual: chamava a
seleção de "carrinho" e precisava avisar três vezes que não havia pagamento, tinha um dashboard
de métricas na porta de entrada do painel, e **escondia silenciosamente qualquer produto além do
48º de uma categoria**. Isso foi corrigido. Ver o changelog abaixo e `docs/ARCHITECTURE.md` §7.

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

## Changelog da sessão 3 (2026-08-06) — alinhamento de produto e correções

Verificado com as ferramentas reais: `mvn clean compile` (backend) e `npm run type-check` /
`npm run lint` / `npm run build` (frontend) — todos limpos, 17 rotas no build. Docker continua
indisponível neste ambiente, então **ainda não houve validação com banco e navegador reais**.

### Decisões de produto (confirmadas explicitamente — ver `docs/ARCHITECTURE.md` §7)

1. **"Carrinho" → "seleção"**: rota `/selecao`, `/carrinho` redireciona (301). Copies da home,
   rodapé, página do produto e da própria tela atualizadas. Os três avisos de "sem pagamento pelo
   site" saíram — deixaram de ser necessários. Nomes internos (`cart-store`, `components/cart/`,
   chave do localStorage) mantidos de propósito.
2. **"Lançamentos" saiu da interface**: seção da home, badge do card e switch do formulário. A
   coluna, o DTO e `GET /produtos/lancamentos` continuam intactos — nenhuma migration, nenhum dado
   perdido, decisão reversível.
3. **`observacoes` agora aparece** na página do produto (antes era preenchido e nunca renderizado
   — a dica do formulário chegava a prometer que apareceria). Dica corrigida.
4. **Painel sem dashboard**: `/admin` redireciona para `/admin/produtos`, "Dashboard" saiu da
   sidebar. Endpoint, hook e `StatCard` preservados sem uso.

### Falhas reais contra a visão do produto (corrigidas)

5. **Catálogo truncava em 48 produtos.** `/categoria/[slug]` e `/busca` pediam `size=48` e não
   paginavam — do 49º produto em diante a peça ficava invisível e ninguém era avisado. Era o
   defeito mais sério do projeto. Agora paginam em 24 por página via URL (`?page=`), com
   `<Link>` server-rendered para o catálogo inteiro ser rastreável. Novos:
   `lib/paginacao.ts`, `components/ui/PaginationLinks.tsx`.
6. **Não dava para "deslizar entre as imagens"**, apesar de ser requisito explícito. A galeria
   ganhou swipe horizontal (com detecção de gesto vertical, para não trocar a foto durante um
   scroll), setas de anterior/próxima e contador "3 / 7".
7. **Vídeo abria em tela cheia forçada no iPhone**: faltava `playsInline` no `<video>`
   (adicionado junto com `preload="metadata"`).
8. **Zoom da galeria prendia o teclado**: sem `Esc` e sem foco inicial. Agora fecha com `Esc`,
   navega com as setas e foca o botão de fechar ao abrir.
9. **SEO essencialmente ausente**, apesar de ser requisito. Adicionados: `metadataBase`
   (sem ele o preview do link no WhatsApp saía sem imagem), Open Graph no layout raiz e na página
   do produto (com a foto da peça), `app/robots.ts`, `app/sitemap.ts` gerado do catálogo real,
   `canonical` em produto e categoria, `noindex` na busca. Nova variável:
   `NEXT_PUBLIC_SITE_URL`.
10. **Sem link para "Categorias" no celular** fora da home (só no rodapé) — adicionado ao header
    mobile.

### Copy e polimento

11. O diálogo de exclusão dizia à dona da loja que o produto *"pode ser recuperado pelo suporte
    técnico"* — não existe suporte técnico. Agora explica a alternativa que ela realmente tem:
    usar "ocultar".
12. Mensagem do WhatsApp reformatada: mesma informação (referência, nome, quantidade por tamanho,
    valor unitário, subtotal, total de peças, valor total), mas agrupada por produto em vez de uma
    linha em branco entre **todas** as linhas — com muitas peças, a mensagem antiga virava uma
    parede de texto. `montarMensagemPedido` → `montarMensagemSelecao`.
13. `gap-x` faltando nos grids de categoria (home e índice) — os rótulos podiam encostar.
14. **`docs/ARCHITECTURE.md` §3.3 reescrito**: a "evolução planejada para ISR" foi removida. Ela
    contradizia a promessa central do produto ("salvou, apareceu") — cachear as páginas públicas
    reintroduziria exatamente a janela de dados velhos que o sistema existe para eliminar.

---

## Changelog da sessão 2 (2026-08-05) — bugs corrigidos e refatorações

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
    segurança que motivou o upgrade; ver `docs/ARCHITECTURE.md` §3.7 para a tabela de versões e o
    racional completo dessa decisão).
12. **Migração de ESLint para flat config**: `.eslintrc.json` → `eslint.config.mjs` (exigência do
    `eslint-config-next@16`, que só suporta ESLint ≥ 9). Descoberta no processo: a forma
    documentada com `FlatCompat` quebra nesta versão do `eslint-config-next` com "Converting
    circular structure to JSON" — a forma que funciona é importar `eslint-config-next` diretamente
    (ele já exporta o array flat). Documentado em `docs/ARCHITECTURE.md` §3.7 para não perder essa
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

**Site público**: Home, `/categoria`, `/categoria/[slug]`, `/produto/[referencia]`, `/busca`,
`/selecao` (+ `robots.txt` e `sitemap.xml` gerados). Construído na sessão 1; revisado na sessão 3
(paginação real, galeria com swipe, SEO, vocabulário de seleção — ver changelog).

**Painel administrativo — construído inteiro nesta sessão:**
- [x] `/admin/login` — formulário com react-hook-form + Zod, redireciona se já autenticado.
- [x] `/admin/(protegido)/layout.tsx` — guard de autenticação client-side, sidebar responsiva
      (colapsa em mobile), `<Toaster />` (sonner) para feedback de mutações.
- [x] `/admin` — redireciona para `/admin/produtos` (o dashboard foi retirado na sessão 3; o
      endpoint e os componentes continuam no código, sem uso — ver `ARCHITECTURE.md` §7.4).
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
- [ ] Frontend: testes unitários de `lib/cart.ts`/`lib/whatsapp.ts`/`lib/paginacao.ts` (funções
      puras, fáceis de testar) com Vitest; considerar Playwright para o fluxo
      "adicionar à seleção → enviar pelo WhatsApp" e para o CRUD do painel mais adiante.

### 2. Verificação manual real (parcialmente feita na sessão 5)

**Já verificado** (sessão 5, via `curl` contra o contêiner de produção — sem navegador): login,
autorização das rotas, CORS, criação de categoria e produto, alteração de preço, ocultar produto,
e a propagação imediata para o catálogo público.

**Continua faltando**, porque exige navegador e/ou dispositivo real:
- [ ] Confirmar no navegador: upload de foto/vídeo real no Cloudinary (precisa de uma conta
      Cloudinary de verdade), reordenação por drag-and-drop, a tela de seleção, e o link do
      WhatsApp abrindo com a mensagem correta.
- [ ] Testar responsividade do painel administrativo em mobile de verdade (foi construído
      mobile-first com Tailwind, mas nunca visualizado num navegador real).
- [ ] **Específico da sessão 3, precisa de dispositivo real:** swipe da galeria num celular
      (inclusive confirmando que o scroll vertical da página não troca a foto), vídeo tocando
      *inline* num iPhone, e o preview do link do produto colado numa conversa do WhatsApp
      aparecendo com a foto (depende de `NEXT_PUBLIC_SITE_URL` correto e do site publicado).

### 3. Deploy

O **código** está pronto e verificado para produção (sessão 5 — ver changelog abaixo). O que
falta é a parte que exige contas e cliques no navegador, documentada passo a passo em
**[`docs/DEPLOY.md`](DEPLOY.md)**.

- [x] ~~Preparar o backend para produção~~ — Dockerfile, health check, bootstrap seguro do
      primeiro admin, CORS validado, pool ajustado para a Neon.
- [x] ~~Impedir que um deploy mal configurado aponte para `localhost`~~ — o build do frontend
      agora falha se `NEXT_PUBLIC_API_URL` ou `NEXT_PUBLIC_SITE_URL` faltarem.
- [ ] Criar o projeto na **Neon** e pegar a connection string.
- [ ] Criar o serviço na **Railway** (root directory `backend`) e preencher as variáveis.
- [ ] Criar o projeto na **Vercel** (root directory `frontend`) e preencher as variáveis.
- [ ] Rodar o bootstrap do primeiro admin e **remover as variáveis depois**.
- [ ] Verificação ponta a ponta no ambiente real (o roteiro está em `DEPLOY.md` §8).
- [ ] Configurar domínio próprio apontando para a Vercel (`DEPLOY.md` §10 — opcional, não bloqueia).

### 4. Pendências de design/produto
- [x] ~~Paleta e logo reais~~ — **resolvido na sessão 4**: extraídos do catálogo impresso, não
      inventados. Ver `docs/DESIGN_SYSTEM.md`.
- [x] ~~Favicon e imagem de Open Graph~~ — **resolvido na sessão 4** (a da página do produto já
      vinha da sessão 3, pela foto principal da peça).
- [x] ~~Banner da home~~ — **resolvido na sessão 4**: a home abre com o logo sobre o creme
      rabiscado, reproduzindo a capa do catálogo.
- [ ] **Logo em vetor.** O arquivo usado hoje foi extraído do PDF em bitmap (236×293). Funciona
      bem nos tamanhos atuais, mas se a loja tiver o SVG/AI original, trocar melhora a nitidez em
      telas grandes e permite versão monocromática.
- [ ] **Fotos com fundo removido.** O catálogo impresso usa PNG recortado, e o site foi
      construído para isso (`object-contain`, sem moldura). Fotos com fundo próprio funcionam,
      mas ficam visivelmente menos elegantes sobre o creme. Vale orientar a administradora.

### 5. Pequenos gaps conhecidos (não são bugs, são decisões de escopo)
- [ ] **Imagem de categoria órfã no Cloudinary**: `Categoria` só guarda `imagemUrl` (sem
      `publicId`), então trocar a imagem de capa não apaga o asset antigo no Cloudinary (fica
      órfão, consumindo cota, sem impacto funcional). Produtos não têm esse problema (imagens de
      produto guardam `publicId` e são apagadas corretamente). Resolver exigiria adicionar coluna
      + migration; adiado por ser um custo pequeno (storage) sem urgência.
- [ ] Filtros de busca pública (`/busca`, `/categoria/[slug]`) não expõem sexo/coleção na UI
      (o backend já suporta), só busca por texto. **Antes de implementar, perguntar**: a cliente
      procura por "sexo" num catálogo de 200 peças, ou navega por categoria? Se a resposta não for
      clara, isto é filtro de e-commerce, não de vitrine.
- [ ] **Reordenação de produtos** (`PATCH /admin/produtos/reordenar` existe, a tela não usa).
      Revisado na sessão 3 e **rebaixado de propósito**: combinar drag-and-drop com paginação e
      filtros é caro, e a visão do produto nunca pediu controle manual da ordem das peças. Se um
      dia a ordem incomodar, a pergunta certa é *qual ordem automática serve melhor a cliente*
      (mais recentes primeiro?) — não *como deixo a administradora arrastar 200 produtos*.
- [x] ~~Sem paginação nas listagens públicas~~ — **resolvido na sessão 3** (era truncamento
      silencioso em 48 produtos, não um gap de escopo; ver changelog e `ARCHITECTURE.md` §7.5).

### 6. Melhorias arquiteturais consideradas mas conscientemente adiadas
Ver `docs/ARCHITECTURE.md` §6 (multi-empresa/SaaS, favoritos, produtos relacionados, relatórios/
importação/exportação) — nenhuma implementada de propósito. **Não confundir com a seção §5 do
mesmo documento** (estoque e persistência de pedidos), que não é "adiada" — é excluída por
decisão de produto, não deve ser implementada sem confirmação explícita nova.

### 7. Antes de aceitar qualquer ideia nova, faça esta pergunta

> *"Isso ajuda a dona da loja a abandonar o Canva e a vender mais facilmente pelo WhatsApp?"*

Se a resposta for não, provavelmente não pertence a este produto — por mais que a funcionalidade
exista em toda loja virtual. `docs/ARCHITECTURE.md` §7 registra as decisões já tomadas sob esse
critério (e §5, o escopo permanentemente excluído).

---

## Próximo passo recomendado

1. **Publicar** seguindo [`docs/DEPLOY.md`](DEPLOY.md) — Neon, depois Railway, depois Vercel.
   O código já está preparado e verificado em contêiner; o que resta são contas e cliques.
   Fazer isto primeiro resolve dois problemas de uma vez: coloca o sistema no ar **e** dá o
   ambiente real onde a verificação visual finalmente pode acontecer.
2. **Verificação visual no navegador** (item 2 acima) — segue sendo o maior risco residual: o
   projeto compila e builda limpo há quatro sessões, mas **nenhuma tela foi vista renderizada com
   dados reais**. Depois do deploy, dá para fazer isso no site publicado, do celular, sem montar
   ambiente. Espere aparecerem pequenos ajustes visuais.
3. Corrigir o que a verificação visual apontar.
4. Testes automatizados (item 1) — pelo menos um smoke test de contexto do Spring Boot
   (`@SpringBootTest` com Testcontainers) e os testes unitários de `lib/cart.ts`/`whatsapp.ts`
   no frontend, que são baratos e de alto valor por serem lógica de negócio pura.
5. Pendências de design (item 4) — principalmente orientar a administradora sobre fotos com fundo
   removido; pode rodar em paralelo.
