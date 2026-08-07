# Progresso do deploy — ambiente online

Documento de handoff da fase de **deploy e ambiente online** (iniciada em 2026-08-07).
Registra o estado exato em que a sessão parou, para que a próxima continue sem refazer análise.

> **Estado:** auditoria concluída, correções de backend parcialmente aplicadas.
> **Nada foi publicado na internet ainda.** Nenhuma conta foi criada na Vercel, Railway ou Neon.

---

## 1. Objetivo da fase

Transformar o projeto — que hoje só roda abrindo três terminais no PowerShell — em uma aplicação
com URLs permanentes:

- catálogo público em uma URL, para enviar às clientes;
- painel administrativo em `/admin` da mesma URL, para a administradora;
- funcionando com o computador do desenvolvedor desligado;
- deploy automático a partir de `git push`.

A arquitetura já documentada (**Vercel** + **Railway** + **Neon** + **Cloudinary**) foi avaliada
nesta sessão e **considerada adequada — será mantida**, sem redesenho.

---

## 2. O que foi analisado

### Documentos lidos nesta sessão
- `docs/ARCHITECTURE.md` (integral)
- `README.md` (integral)

### Documentos **não** lidos nesta sessão (pendência de leitura)
- `docs/DATABASE_SCHEMA.md`
- `docs/API_CONTRACT.md`
- `docs/PROGRESS.md` (foi editado na sessão anterior, mas não relido nesta)
- `docs/DESIGN_SYSTEM.md` (conteúdo já estava em contexto; sem impacto em deploy)

Nenhum deles bloqueou a auditoria — os achados vieram do código —, mas a próxima sessão deve ler
`API_CONTRACT.md` antes de testar os fluxos ponta a ponta.

### Código inspecionado
| Arquivo | Para verificar |
|---|---|
| `backend/src/main/resources/application.yml` | porta, context-path, CORS, JWT, Cloudinary, actuator |
| `backend/src/main/resources/application-dev.yml` | banco local, admin de desenvolvimento |
| `backend/src/main/resources/application-prod.yml` | banco de produção, logs |
| `backend/.../config/SecurityConfig.java` | rotas públicas x protegidas, CORS |
| `backend/.../config/CorsProperties.java` | binding da variável de origens |
| `backend/.../config/DevAdminInitializer.java` | criação do primeiro admin |
| `backend/.../config/DevAdminProperties.java` | idem |
| `backend/.../domain/entity/Usuario.java` | campos obrigatórios do admin |
| `backend/pom.xml` | Java 21, `finalName`, dependências |
| `frontend/src/lib/api.ts` | URL da API, anexação do JWT |
| `frontend/src/lib/auth.ts` | sessão em localStorage |
| `frontend/src/app/admin/(protegido)/layout.tsx` | guard de autenticação |
| `frontend/next.config.mjs` | domínios de imagem, redirects |
| `backend/.env.example` / `frontend/.env.example` | variáveis existentes |
| `.gitignore` | vazamento de segredos |

---

## 3. Comandos executados e resultados

| Comando (resumido) | Resultado |
|---|---|
| `git remote -v` | `origin https://github.com/ArthurQueiroz23/Catalogo-FM.git` |
| `git log --oneline -3` | `23d13e0 testado e front att` (topo) |
| `git ls-remote --heads origin` | remoto em `23d13e0` — **local e remoto sincronizados** |
| `git status --short \| wc -l` (início da sessão) | `0` — tudo commitado |
| `command -v gh vercel railway neonctl flyctl` | **todos "NAO INSTALADO"** |
| `ls backend/src/main/resources/db/migration/` | `V1__create_schema.sql`, `V2__seed_tamanhos.sql` |
| `ls backend/Dockerfile railway.json nixpacks.toml Procfile` | **nenhum existe** |
| `ls backend/docker-compose.yml` | **não existe** (o README usa `docker run`) |
| `ls frontend/vercel.json` | **não existe** |
| `grep -rn "localhost\|127.0.0.1" backend/src/main frontend/src` | 4 ocorrências, todas com fallback de env (detalhe em §5) |
| `grep -n actuator backend/pom.xml` | **AUSENTE** |
| `grep -rn "401\|limparSessao\|logout"` no frontend | nenhum tratamento global de 401 |
| `grep -rn "DevAdmin\|dev-admin"` (após as mudanças) | 1 referência obsoleta em `docs/PROGRESS.md:358` |
| `mvn -q clean compile` (após as mudanças) | **exit 0 — compila limpo** |

---

## 4. Achados da auditoria

### O que já estava correto (não precisa mexer)
- Perfis `dev` / `prod` separados; `SPRING_PROFILES_ACTIVE` externalizado.
- `server.port` já lê `${PORT:8080}` — compatível com a porta dinâmica da Railway.
- CORS já vinha de variável de ambiente (`APP_CORS_ALLOWED_ORIGINS`).
- JWT stateless; segredo e expiração externalizados.
- Flyway como fonte da verdade do schema, com `ddl-auto: validate`.
- Upload direto navegador → Cloudinary; o backend nunca recebe o binário (só assina).
- `next.config.mjs` restringe imagens a `res.cloudinary.com`.
- `.gitignore` cobre `.env`, `backend/.env`, `frontend/.env*`, preservando os `.env.example`.
- **Nenhum segredo commitado.** Todo o código está commitado e pushado.
- `mvnw` / `mvnw.cmd` versionados — a build não depende de Maven instalado.

### Bloqueadores encontrados

**B1 — Não havia como criar o primeiro administrador em produção.**
`application-prod.yml` tinha `app.dev-admin.enabled: false` e não existia alternativa. Um deploy
novo subiria com o banco vazio e **login impossível** (não há tela de cadastro, por design).
→ *Corrigido nesta sessão (§5).*

**B2 — `spring-boot-starter-actuator` não estava no `pom.xml`**, embora `application.yml` e
`SecurityConfig` já referenciassem `/actuator/health`. O health check da Railway apontaria para
um 404 e o serviço seria marcado como morto.
→ *Corrigido nesta sessão (§5).*

**B3 — Nenhum arquivo de build para a Railway** (sem `Dockerfile`).
→ **AINDA PENDENTE.**

### Riscos menores encontrados

**R1 — `NEXT_PUBLIC_API_URL` cai silenciosamente para `http://localhost:8080/api/v1`**
(`frontend/src/lib/api.ts:3`). Um deploy sem a variável configurada sobe "com sucesso" e só quebra
no navegador da cliente. → **AINDA PENDENTE.**

**R2 — Hikari não estava ajustado para a Neon**, que suspende o banco após ~5 min ocioso e encerra
conexões paradas. → *Corrigido nesta sessão (§5).*

**R3 — CORS aceitava lista fixa de origens.** Os previews da Vercel recebem subdomínio novo a cada
push e seriam todos bloqueados. → *Corrigido nesta sessão (§5).*

**R4 — Sem tratamento global de 401 no frontend.** `estaAutenticado()` só verifica a *presença* do
token, não a validade. Com token expirado, a administradora vê o painel carregar e depois recebe
erros nas listagens, em vez de ser levada de volta ao login. Não bloqueia o deploy.
→ **PENDENTE — decidir se entra nesta fase ou vira item separado.**

**R5 — O guard de `/admin` é client-side.** É coerente com o desenho (JWT em `localStorage`) e os
dados continuam protegidos pela API, mas a casca da página chega a renderizar antes do redirect.
Não bloqueia o deploy; registrado para não ser "descoberto" como bug depois.

**R6 — `docs/PROGRESS.md:358` cita `DevAdminInitializer`**, classe que deixou de existir.
→ **PENDENTE (correção de uma linha).**

---

## 5. Alterações já aplicadas

Todas no backend. **Compilam** (`mvn clean compile` → exit 0). **Não foram testadas em execução.**

| Arquivo | Mudança |
|---|---|
| `backend/pom.xml` | **+** `spring-boot-starter-actuator` (resolve B2) |
| `backend/.../config/AdminBootstrapProperties.java` | **novo** — `@ConfigurationProperties("app.admin-bootstrap")` |
| `backend/.../config/AdminBootstrapInitializer.java` | **novo** — cria o primeiro admin (resolve B1) |
| `backend/.../config/DevAdminInitializer.java` | **removido** (substituído) |
| `backend/.../config/DevAdminProperties.java` | **removido** (substituído) |
| `backend/.../config/SecurityConfig.java` | CORS: `setAllowedOriginPatterns` + rejeita lista vazia e `*` (resolve R3) |
| `backend/src/main/resources/application-dev.yml` | `app.dev-admin` → `app.admin-bootstrap` (credenciais de dev inalteradas) |
| `backend/src/main/resources/application-prod.yml` | reescrito: Hikari p/ Neon, retries do Flyway, actuator, bloco `admin-bootstrap` |

### Decisões técnicas tomadas

**D1 — Um único inicializador de admin, em vez de dois.**
`DevAdminInitializer` virou `AdminBootstrapInitializer`, servindo dev e produção. Duas classes
capazes de criar administradores seriam uma armadilha de segurança: bastaria uma habilitar por
engano. Regras da classe:
1. só age com `app.admin-bootstrap.enabled=true`;
2. só age se o banco **não tiver nenhum usuário** — nunca sobrescreve nem redefine senha de admin
   existente, então deixar a variável ligada por engano não reabre uma porta;
3. **fora do perfil `dev`, exige senha de no mínimo 12 caracteres e derruba a aplicação** se for
   menor. Proposital: é preferível o deploy falhar de forma visível a subir um painel de produção
   com senha adivinhável;
4. loga instrução para remover as variáveis de ambiente depois do primeiro login.

As credenciais de desenvolvimento (`admin@frutodamalha.com.br` / `admin123`) **continuam
funcionando iguais** — a exigência de senha forte não se aplica ao perfil `dev`.

**D2 — CORS por padrão de origem, não por lista literal.**
`setAllowedOriginPatterns` em vez de `setAllowedOrigins`, para que os previews da Vercel funcionem.
Continua restrito: a aplicação **recusa subir** se a variável estiver vazia ou contiver `*`, porque
a API usa credenciais (JWT) e um curinga permitiria a qualquer site chamar os endpoints do painel.

**D3 — O health check não depende do banco** (`management.health.db.enabled: false`).
Com a Neon suspensa por inatividade, o primeiro probe falharia e a plataforma reiniciaria um
contêiner saudável em laço. A conectividade com o banco continua validada pelo Flyway na subida.

**D4 — Pool sem conexões ociosas mínimas** (`minimum-idle: 0`, `max-lifetime: 5min`).
A Neon encerra conexões paradas do lado do servidor; um pool que as segura entrega sockets mortos
e o primeiro acesso do dia falha em vez de apenas demorar.

---

## 6. Variáveis de ambiente necessárias em produção

> Nenhum valor real aparece aqui nem deve ser commitado. Todos vão nos painéis da Railway/Vercel.

### Railway (backend Spring Boot)

| Variável | Observação |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | JDBC da Neon — **precisa de `?sslmode=require`** |
| `DB_USERNAME` | usuário da Neon |
| `DB_PASSWORD` | senha da Neon |
| `APP_JWT_SECRET` | ≥ 32 caracteres aleatórios (`openssl rand -base64 64`) |
| `APP_JWT_EXPIRATION_MS` | opcional, padrão `86400000` (24 h) |
| `APP_CORS_ALLOWED_ORIGINS` | domínio do frontend na Vercel; vírgula separa múltiplos |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | do dashboard do Cloudinary |
| `CLOUDINARY_BASE_FOLDER` | sugestão: `frutodamalha/prod` |
| `PORT` | injetada automaticamente pela Railway — **não definir manualmente** |
| `APP_ADMIN_BOOTSTRAP_ENABLED` | `true` **apenas** no primeiro deploy; remover depois |
| `APP_ADMIN_BOOTSTRAP_EMAIL` | e-mail da administradora; remover depois |
| `APP_ADMIN_BOOTSTRAP_SENHA` | ≥ 12 caracteres; remover depois do primeiro login |
| `APP_ADMIN_BOOTSTRAP_NOME` | opcional, padrão `Administradora` |

### Vercel (frontend Next.js)

| Variável | Observação |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública da Railway **+ `/api/v1`**, sem barra final |
| `NEXT_PUBLIC_SITE_URL` | domínio do próprio site, sem barra final |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | formato internacional só com números |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` / `_EMAIL` / `_TELEFONE` / `_ENDERECO` | rodapé |

⚠️ **`NEXT_PUBLIC_*` é embutida no bundle durante o build.** Trocar o valor exige um *redeploy* —
não basta salvar a variável no painel.

⚠️ **Ovo e galinha na primeira configuração:** o frontend precisa da URL da Railway e o backend
precisa da URL da Vercel para o CORS. Ordem sugerida: Neon → Railway (com `APP_CORS_ALLOWED_ORIGINS`
provisório) → Vercel → voltar na Railway e corrigir o CORS com a URL real.

---

## 7. O que ainda falta

### Backend
- [ ] **`backend/Dockerfile`** multi-stage (build com Maven + runtime JRE 21) — resolve **B3**
- [ ] `backend/.dockerignore`
- [ ] `railway.json` — health check em **`/api/v1/actuator/health`** (o context-path é `/api/v1`;
      esquecer o prefixo é o erro mais provável aqui) e política de restart
- [ ] Atualizar `backend/.env.example` com as variáveis novas de `APP_ADMIN_BOOTSTRAP_*`

### Frontend
- [ ] Fazer `NEXT_PUBLIC_API_URL` **falhar alto** quando ausente em build de produção (**R1**)
- [ ] Avaliar `vercel.json` (headers de segurança) — verificar se é mesmo necessário
- [ ] Decidir sobre o tratamento global de 401 (**R4**)

### Verificação local (antes de qualquer deploy)
- [ ] `docker build` do backend + subir o contêiner apontando para o Postgres local
- [ ] Confirmar `GET /api/v1/actuator/health` respondendo `200`
- [ ] Testar o `AdminBootstrapInitializer` **em perfil `prod`**: senha curta deve derrubar a
      aplicação; senha forte deve criar o admin; segunda subida deve ignorar
- [ ] `npm run type-check`, `npm run lint`, `npm run build` no frontend
- [ ] `mvn clean test` no backend

### Deploy (exige contas e ações manuais do dono do projeto)
- [ ] Criar projeto na **Neon**, pegar a connection string
- [ ] Criar serviço na **Railway** apontando para `ArthurQueiroz23/Catalogo-FM`, raiz `backend/`
- [ ] Criar projeto na **Vercel**, raiz `frontend/`
- [ ] Rodar o bootstrap do primeiro admin e **remover as variáveis depois**
- [ ] Ajustar `APP_CORS_ALLOWED_ORIGINS` com o domínio real da Vercel
- [ ] Verificação ponta a ponta (admin cria produto → aparece no catálogo público)

### Documentação
- [ ] `docs/DEPLOY.md` — passo a passo operacional
- [ ] `README.md` — separar "desenvolvimento local" de "produção", listar as URLs
- [ ] `docs/ARCHITECTURE.md` §4 — atualizar com o desenho real do deploy
- [ ] `docs/PROGRESS.md` — changelog da fase **e corrigir a linha 358** (**R6**)
- [ ] Documentar como configurar domínio próprio depois
- [ ] Documentar como criar o ambiente de staging depois

---

## 8. Próximo passo exato

**Criar `backend/Dockerfile`** (multi-stage, `eclipse-temurin:21-jdk` para build e `21-jre` para
runtime, usando `./mvnw` já versionado, gerando `target/catalogo.jar` conforme o `finalName` do
`pom.xml`), junto de `backend/.dockerignore` e `railway.json`.

Em seguida, **construir e subir esse contêiner localmente** contra o Postgres do Docker, com
`SPRING_PROFILES_ACTIVE=prod`, para validar de uma vez: o Dockerfile, o health check no caminho
`/api/v1/actuator/health`, o `AdminBootstrapInitializer` sob as regras de produção e o CORS novo.

Só depois disso partir para as contas na Neon/Railway/Vercel.

---

## 9. Limitação importante para planejar a próxima sessão

**Nenhuma CLI de deploy está instalada** (`gh`, `vercel`, `railway`, `neonctl` — todas ausentes) e
não há credenciais dessas plataformas disponíveis no ambiente.

Consequência prática: **a criação das contas e dos projetos na Neon, Railway e Vercel terá de ser
feita manualmente pelo dono do projeto**, pelo navegador. O que pode ser preparado por completo
antes disso é todo o resto — arquivos de configuração, correções de código, verificação local com
Docker e o roteiro passo a passo. Depois que as URLs existirem, a verificação ponta a ponta pode
ser feita por linha de comando contra os endereços reais.

Alternativa, se preferir automatizar: instalar as CLIs (`npm i -g vercel`, `npm i -g @railway/cli`)
e autenticar uma vez — a partir daí boa parte do deploy vira comando.
