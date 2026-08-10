# Progresso do deploy — ambiente online

Registro da fase de **deploy e ambiente online** (2026-08-10).

> **Estado: preparação concluída e verificada em contêiner. Nada publicado ainda.**
> Nenhuma conta foi criada na Vercel, Railway ou Neon — essa parte exige o navegador e as
> credenciais do dono do projeto.
>
> 📖 Para **executar** o deploy, use [`DEPLOY.md`](DEPLOY.md). Este arquivo é o histórico da
> preparação: o que foi auditado, o que mudou e por quê.

---

## 1. Objetivo

Sair do "abrir três terminais no PowerShell" para URLs permanentes: catálogo público em um
endereço, painel em `/admin` do mesmo endereço, funcionando com o computador do desenvolvedor
desligado, publicando por `git push`.

A arquitetura já documentada (**Vercel** + **Railway** + **Neon** + **Cloudinary**) foi auditada e
**mantida**. Não houve redesenho.

---

## 2. Auditoria

### Lido nesta fase
`docs/ARCHITECTURE.md`, `README.md`, os três `application*.yml`, `SecurityConfig`,
`CorsProperties`, `DevAdminInitializer`/`DevAdminProperties`, `Usuario`, `pom.xml`,
`frontend/src/lib/api.ts`, `lib/auth.ts`, `lib/config.ts`, `lib/admin-api.ts`,
`app/admin/(protegido)/layout.tsx`, `next.config.mjs`, ambos os `.env.example`, `.gitignore`.

**Não lidos:** `docs/DATABASE_SCHEMA.md` e `docs/API_CONTRACT.md`. Nenhum achado dependeu deles —
os endpoints usados na verificação foram conferidos direto em `admin-api.ts`.

### O que já estava correto
`PORT` externalizado; CORS por variável; JWT stateless com segredo externo; Flyway como fonte da
verdade com `ddl-auto: validate`; upload direto para o Cloudinary sem passar pelo servidor;
imagens restritas a `res.cloudinary.com`; `.gitignore` correto; **nenhum segredo commitado**;
`mvnw` versionado.

### Bloqueadores encontrados — todos resolvidos

| # | Problema | Consequência |
|---|---|---|
| B1 | Nenhuma forma de criar o primeiro admin em produção | Deploy subiria com banco vazio e **login impossível** |
| B2 | `spring-boot-starter-actuator` ausente do `pom.xml`, mas `/actuator/health` já referenciado | Health check em 404 → serviço reiniciado em laço |
| B3 | Nenhum arquivo de build para a Railway | Build por auto-detecção, imprevisível |

### Riscos menores

| # | Problema | Situação |
|---|---|---|
| R1 | `NEXT_PUBLIC_API_URL`/`SITE_URL` caindo para `localhost` | ✅ resolvido — build falha |
| R2 | Hikari não ajustado para a suspensão da Neon | ✅ resolvido |
| R3 | CORS bloquearia os previews da Vercel | ✅ resolvido |
| R4 | Sem tratamento global de 401 no frontend | ⏳ **em aberto** — ver §6 |
| R5 | Guard de `/admin` é client-side | ℹ️ por design; API protegida no servidor |
| R6 | `PROGRESS.md` citava classe removida | ✅ corrigido |

---

## 3. Alterações aplicadas

### Backend
| Arquivo | Mudança |
|---|---|
| `pom.xml` | **+** `spring-boot-starter-actuator` (B2) |
| `config/AdminBootstrapProperties.java` | **novo** |
| `config/AdminBootstrapInitializer.java` | **novo** — primeiro admin (B1) |
| `config/DevAdminInitializer.java` · `DevAdminProperties.java` | **removidos** |
| `config/SecurityConfig.java` | CORS por padrão de origem; recusa lista vazia e `*` (R3) |
| `application-dev.yml` | `app.dev-admin` → `app.admin-bootstrap` (credenciais de dev iguais) |
| `application-prod.yml` | reescrito: Hikari p/ Neon (R2), retries do Flyway, health sem banco, bloco de bootstrap |
| `Dockerfile` · `.dockerignore` · `railway.json` | **novos** (B3) |
| `.env.example` | documenta as variáveis de bootstrap |

### Frontend
| Arquivo | Mudança |
|---|---|
| `src/lib/api.ts` | `NEXT_PUBLIC_API_URL` ausente derruba o build de produção (R1) |
| `src/lib/config.ts` | idem para `NEXT_PUBLIC_SITE_URL` (R1) |

### Documentação
`docs/DEPLOY.md` (novo), `docs/ARCHITECTURE.md` §4.1–4.3, `docs/PROGRESS.md` (changelog + §2, §3,
próximos passos), `README.md` (bloco de URLs, §11, §17).

---

## 4. Decisões técnicas

**D1 — Um único inicializador de admin.** Duas classes capazes de criar administradores seriam
uma armadilha: bastaria uma ser habilitada por engano. A mesma classe serve dev e produção; o que
muda é a origem dos valores e o rigor da senha.

**D2 — Configuração inválida derruba a aplicação, não degrada.** Vale para CORS vazio/`*`, senha
fraca e variáveis de URL ausentes. Um erro que se manifesta longe da causa (site no ar chamando
`localhost`) custa mais caro que um deploy que falha na cara do operador.

**D3 — Bootstrap nunca sobrescreve admin existente.** Variável esquecida ligada não reabre porta.

**D4 — Health check não consulta o banco.** Com a Neon suspensa, o probe falharia e a plataforma
reiniciaria um contêiner saudável em laço. O Flyway já valida a conexão na subida.

**D5 — CORS por `allowedOriginPatterns`.** Previews da Vercel têm subdomínio novo a cada push.
Continua restrito: `*` puro é recusado.

---

## 5. Verificação executada

Imagem construída (`docker build`) e executada em perfil `prod` contra um Postgres limpo.

| # | Teste | Resultado |
|---|---|---|
| 1 | `docker build` | ✅ sucesso |
| 2 | CORS `*` | ✅ **recusa subir**, mensagem explicativa |
| 3 | CORS vazio | ✅ **recusa subir** |
| 4 | Senha de bootstrap `admin123` | ✅ **recusa subir** (mínimo 12) |
| 5 | Bootstrap ligado sem e-mail/senha | ✅ **recusa subir** |
| 6 | Após 2–5, usuários no banco | ✅ `0` |
| 7 | `GET /api/v1/actuator/health` | ✅ `{"status":"UP"}` — caminho do `railway.json` |
| 8 | Bootstrap com senha forte | ✅ admin criado, e-mail normalizado para minúsculas |
| 9 | Login | ✅ JWT retornado |
| 10 | Reinício com credenciais **diferentes** | ✅ nenhum usuário novo; senha original intacta |
| 11 | CORS origem exata / preview / não autorizada | ✅ `200` / `200` / **`403`** |
| 12 | Catálogo público sem token | ✅ `200` |
| 13 | `/admin` sem token / token inválido / válido | ✅ `401` / `401` / `200` |
| 14 | Login com senha errada | ✅ `401` |
| 15 | **admin cria categoria → cria produto → catálogo público mostra** | ✅ |
| 16 | **admin muda preço → catálogo público mostra o novo** | ✅ `49.90` → `59.90` |
| 17 | **admin oculta → some do site (`404`), continua no painel (`200`)** | ✅ |
| 18 | Build do frontend **sem** as variáveis | ✅ **falha** com a mensagem correta |
| 19 | Build do frontend normal | ✅ sucesso, 17 rotas |
| 20 | `mvn clean package` · `type-check` · `lint` | ✅ todos exit 0 |

Contêineres e rede de teste removidos ao final. O banco de desenvolvimento (`frutodamalha-db`)
não foi tocado.

⚠️ **`mvn test` neste projeto não significa nada:** `src/test` está vazio (já registrado em
`PROGRESS.md` §1). Por isso a verificação acima foi feita exercitando a API real com `curl`,
incluindo os casos de falha — e não confiando em "BUILD SUCCESS".

---

## 6. O que ainda falta

### Exige contas e navegador (dono do projeto)
Roteiro completo em [`DEPLOY.md`](DEPLOY.md).
- [ ] Neon → Railway (root `backend`) → Vercel (root `frontend`)
- [ ] Bootstrap do primeiro admin e **remoção das variáveis depois**
- [ ] `APP_CORS_ALLOWED_ORIGINS` e `NEXT_PUBLIC_SITE_URL` com as URLs reais
- [ ] Verificação ponta a ponta no ambiente real (`DEPLOY.md` §8)

### Em aberto, não bloqueia
- [ ] **R4 — 401 global no frontend.** `estaAutenticado()` só verifica a *presença* do token, não
      a validade. Com token expirado, a administradora vê o painel carregar e depois recebe erros
      nas listagens, em vez de voltar ao login. Correção natural: no `apiFetch`, ao receber 401
      numa chamada com `auth: true`, limpar a sessão e redirecionar.
- [ ] **Nenhum teste automatizado** (`src/test` vazio).
- [ ] **Verificação visual no navegador** — nenhuma tela foi vista renderizada com dados reais.
      Depois do deploy isso fica fácil: basta abrir o site publicado no celular.
- [ ] Domínio próprio (`DEPLOY.md` §10) e staging com banco separado (`DEPLOY.md` §11).

---

## 7. Limitação de ambiente

Nenhuma CLI de deploy está instalada (`gh`, `vercel`, `railway`, `neonctl` — todas ausentes) e não
há credenciais dessas plataformas no ambiente. A criação dos projetos precisa ser feita pelo
navegador.

Se quiser automatizar depois: `npm i -g vercel` e `npm i -g @railway/cli`, autenticar uma vez.
