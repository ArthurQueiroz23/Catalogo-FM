# Deploy — como colocar o catálogo no ar

Guia operacional para publicar o Fruto da Malha e mantê-lo lá.

Escrito para quem programa mas nunca fez um deploy profissional. Cada passo diz **qual site
abrir, onde clicar, o que copiar e onde colar**. Nenhum segredo aparece neste arquivo — eles
ficam só nos painéis dos serviços.

> Para rodar na sua máquina, use o [README](../README.md). Publicar não tira nada do `localhost`:
> os dois ambientes convivem.

---

## 1. O desenho

```
   Cliente / Administradora
            │
            ▼
   ┌────────────────────┐
   │       VERCEL       │  site Next.js — catálogo público + /admin
   └─────────┬──────────┘
             │ chamadas à API
             ▼
   ┌────────────────────┐
   │      RAILWAY       │  API Spring Boot — regras, login
   └────┬──────────┬────┘
        │          │
        ▼          ▼
   ┌─────────┐ ┌────────────┐
   │  NEON   │ │ CLOUDINARY │
   │Postgres │ │fotos/vídeos│
   └─────────┘ └────────────┘
```

Catálogo público e painel são **o mesmo site** na Vercel. O painel é a rota `/admin`, protegida
por login. Um endereço para divulgar; um caminho a mais que só sua irmã usa. O cliente nunca vê
função administrativa: a API recusa (`401`) qualquer chamada de painel sem token válido.

As fotos vão do navegador **direto** para o Cloudinary, sem passar pelo servidor. Você já tem
essa conta — só vai reaproveitar as credenciais.

---

## 2. As duas coisas que você vai fazer para sempre

Entender esta diferença evita 90% da confusão com deploy.

### 🟢 Sua irmã cadastra um produto → **NÃO tem deploy**

```
irmã abre /admin  →  cadastra/edita produto  →  salva
                                                  ↓
                                          banco de dados
                                                  ↓
                                  catálogo público já mostra
```

Instantâneo. Nada é reconstruído, nada é republicado. É a promessa central do sistema — o que
substitui *editar no Canva → exportar PDF → reenviar às clientes*.

### 🔵 Você muda o código → **tem deploy, automático**

```
você edita o código  →  git push origin main
                                  ↓
                    Vercel e Railway detectam sozinhas
                                  ↓
                         nova versão publicada
                                  ↓
                          o link é o mesmo
```

Dois a quatro minutos. Você não roda comando de deploy nenhum.

> **Resumindo:** conteúdo (produto, preço, foto, categoria) → sua irmã, sem deploy.
> Comportamento e aparência (código) → você, com `git push`.

---

## 3. Antes de começar

Você vai precisar de:

- a conta do **GitHub** com o projeto (`ArthurQueiroz23/Catalogo-FM`);
- as credenciais do **Cloudinary** que já usa (estão no seu `backend/.env`);
- **dois segredos novos**, gerados agora e guardados num gerenciador de senhas:

**Segredo do JWT** (assina os logins) — gere no PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))
```

**Senha da administradora** — a que sua irmã vai usar. **Mínimo 12 caracteres**; a aplicação
recusa subir com menos, de propósito.

⏱️ Cerca de 40 minutos na primeira vez.

---

## 4. Passo 1 — Banco de dados (Neon)

1. Abra **https://neon.tech** → **Sign up** com o GitHub.
2. **Create project**. Nome `frutodamalha`, região `AWS us-east-1` (mais próxima do Brasil entre
   as gratuitas).
3. Terminada a criação, a tela mostra a **connection string**. Clique em copiar e guarde:

   ```
   postgresql://USUARIO:SENHA@ep-nome-aleatorio.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### O que o Neon te dá, e como isso vira variável na Railway

O Java não aceita esse formato direto. Você vai **quebrar a string em três**:

```
postgresql://maria:abc123@ep-frio-sol.us-east-1.aws.neon.tech/neondb?sslmode=require
             └─┬──┘ └─┬──┘ └──────────────┬──────────────────┘ └──┬──┘ └─────┬─────┘
            usuário  senha              host                    banco       SSL
```

| Variável na Railway | Valor |
|---|---|
| `DB_URL` | `jdbc:postgresql://ep-frio-sol.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `DB_USERNAME` | `maria` |
| `DB_PASSWORD` | `abc123` |

Três regras que evitam o erro mais comum deste passo:

1. troque `postgresql://` por **`jdbc:postgresql://`**;
2. **tire o `usuario:senha@`** do meio da URL — eles vão nos campos separados;
3. **mantenha o `?sslmode=require`** no final. O Neon **exige** SSL; sem isso a conexão é
   recusada.

**Pool de conexões:** já está configurado no projeto (`application-prod.yml`) para o
comportamento do Neon gratuito, que suspende o banco após ~5 minutos ocioso e encerra conexões
paradas. Você não precisa ajustar nada. O efeito prático é que o **primeiro acesso depois de um
tempo parado demora 1–3 segundos a mais** — é o banco acordando, não é erro.

**Migrations:** você não roda nada. O Flyway cria todas as tabelas sozinho na primeira subida do
backend.

---

## 5. Passo 2 — Backend (Railway)

### 5.1 Criar e conectar ao GitHub

1. Abra **https://railway.app** → **Login with GitHub**.
2. **New Project** → **Deploy from GitHub repo**.
3. Escolha `Catalogo-FM`. Se não aparecer, clique em **Configure GitHub App** e autorize o acesso
   a esse repositório.
4. A Railway cria o serviço e já tenta um primeiro build. **Vai falhar** — é esperado, ainda não
   configuramos nada.

### 5.2 Configurar o backend

Abra o serviço → aba **Settings**:

| Campo | Valor |
|---|---|
| **Root Directory** | `backend` |
| Builder | deixe automático — a Railway lê o `railway.json` e usa o `Dockerfile` |
| Build/Start Command | **deixe vazio** — vêm do `Dockerfile` |

> ⚠️ **O Root Directory é o ajuste mais importante desta tela.** Sem ele a Railway tenta
> construir o repositório inteiro, encontra o frontend junto e falha.

O que já vem pronto no projeto e você **não** precisa configurar:

- `Dockerfile` — build em duas etapas (Maven + JDK 21 → JRE 21), roda como usuário sem privilégio
- `railway.json` — health check em `/api/v1/actuator/health`, reinício automático em falha
- porta — a aplicação lê `${PORT}` que a Railway injeta

### 5.3 Configurar as variáveis

Aba **Variables** → **New Variable**, uma por vez:

| Variável | Valor |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | o que você montou no passo 1 |
| `DB_USERNAME` | idem |
| `DB_PASSWORD` | idem |
| `APP_JWT_SECRET` | o segredo gerado no §3 |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:3000` ← provisório, corrigimos no §7 |
| `CLOUDINARY_CLOUD_NAME` | o mesmo do seu `backend/.env` |
| `CLOUDINARY_API_KEY` | idem |
| `CLOUDINARY_API_SECRET` | idem |
| `CLOUDINARY_BASE_FOLDER` | `frutodamalha/prod` |

> ❗ **Não crie uma variável `PORT`.** A Railway injeta sozinha; defini-la manualmente faz o
> contêiner escutar na porta errada e reprovar no health check.

### 5.4 Obter a URL do backend

1. **Settings** → seção **Networking** → **Generate Domain**.
2. A Railway devolve algo como `catalogo-fm-production.up.railway.app`. **Anote — você vai usar
   no passo 3.**
3. Aba **Deployments**: espere o status ficar **Success** (2 a 4 minutos no primeiro build).

### 5.5 Testar o health check

Abra no navegador:

```
https://SEU-DOMINIO-RAILWAY/api/v1/actuator/health
```

Deve aparecer exatamente:

```json
{"status":"UP"}
```

Se apareceu, **o backend subiu e o Flyway criou as tabelas no Neon**. Se não, vá para §11.

---

## 6. Passo 3 — Frontend (Vercel)

### 6.1 Criar e conectar ao GitHub

1. Abra **https://vercel.com** → **Continue with GitHub**.
2. **Add New** → **Project** → **Import** em `Catalogo-FM`.

### 6.2 Configuração do projeto

Na tela de importação:

| Campo | Valor | Observação |
|---|---|---|
| **Root Directory** | `frontend` | clique em **Edit** ao lado do campo ⚠️ |
| **Framework Preset** | `Next.js` | a Vercel detecta sozinha |
| **Build Command** | *deixe o padrão* | resolve para `next build` |
| **Install Command** | *deixe o padrão* | resolve para `npm install` |
| **Output Directory** | *deixe o padrão* | o preset Next.js cuida disso |
| **Node.js Version** | *deixe o padrão* | o `package.json` declara `>=20.9.0` |

> **Por que não existe `vercel.json` no projeto?** Porque não é necessário: com o Root Directory
> apontando para `frontend`, o preset Next.js já produz exatamente os comandos certos. Um arquivo
> de configuração a mais só seria mais uma coisa para manter em sincronia.

### 6.3 Variáveis de ambiente

Ainda na tela de importação, abra **Environment Variables**:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://SEU-DOMINIO-RAILWAY/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | deixe para o §7 (você ainda não sabe o endereço) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | número da loja, só dígitos com código do país (ex.: `5581988072670`) |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | o `@` da loja, **sem** o `@` |
| `NEXT_PUBLIC_EMAIL` | e-mail do rodapé |
| `NEXT_PUBLIC_TELEFONE` | telefone do rodapé |
| `NEXT_PUBLIC_ENDERECO` | endereço do rodapé |

⚠️ O `NEXT_PUBLIC_API_URL` **termina em `/api/v1`** e **não** leva barra no final.

### 6.4 Primeiro deploy

Clique em **Deploy**.

> **Este primeiro deploy vai falhar**, com uma mensagem citando `NEXT_PUBLIC_SITE_URL`.
> É proposital: o sistema recusa publicar um site que não sabe o próprio endereço, porque senão
> os links compartilhados no WhatsApp sairiam quebrados e ninguém perceberia. O §7 resolve.

Anote o endereço que a Vercel gerou (`catalogo-fm.vercel.app` ou parecido).

---

## 7. Passo 4 — Ligar as duas pontas (e o CORS)

Agora que os dois endereços existem, cada lado precisa conhecer o outro.

### Na Vercel

**Settings** → **Environment Variables** → adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://catalogo-fm.vercel.app` — o seu, **sem barra final** |

Depois: **Deployments** → nos `···` do deploy mais recente → **Redeploy**.

> **Por que precisa redeployar?** As variáveis `NEXT_PUBLIC_*` são gravadas **dentro** do site
> durante a construção, não lidas no momento do acesso. Salvar no painel não muda o site que já
> está no ar — só o próximo build.
>
> **Regra permanente: mexeu numa `NEXT_PUBLIC_*` → Redeploy.**

### Na Railway

**Variables** → corrija:

| Variável | Valor |
|---|---|
| `APP_CORS_ALLOWED_ORIGINS` | `https://catalogo-fm.vercel.app,https://*-SEU-USUARIO.vercel.app` |

- a **primeira parte** é o site de verdade;
- a **segunda** libera os *previews* — endereços temporários que a Vercel cria a cada branch, para
  você conferir antes de publicar. Sem ela, o preview abre mas não carrega produto nenhum.

A Railway reinicia sozinha ao salvar.

> **O que é CORS:** o navegador só deixa o site chamar uma API de outro endereço se a API disser
> explicitamente que confia naquele endereço. É essa lista. A aplicação **recusa subir** se você
> deixar em branco ou colocar `*` — a API usa credenciais, e um curinga permitiria a qualquer
> site chamar os endpoints do painel.

---

## 8. Passo 5 — Criar o primeiro acesso da administradora

O banco nasce vazio e **não existe tela de cadastro** — o painel é de uso exclusivo da loja. O
primeiro acesso é criado uma única vez, por variável de ambiente.

### Como funciona

O sistema só cria o administrador quando **as três condições** valem ao mesmo tempo:

1. `APP_ADMIN_BOOTSTRAP_ENABLED=true`;
2. o banco **não tem nenhum usuário** (primeira inicialização de um banco vazio);
3. a senha tem **12 caracteres ou mais**.

Se a senha for curta, **a aplicação não sobe** — é preferível o deploy falhar de forma visível a
publicar um painel com senha adivinhável. E se já existir um administrador, o bootstrap é
**ignorado**: ele nunca sobrescreve nem redefine a senha de quem já existe.

### O que fazer

**Na Railway**, adicione:

| Variável | Valor |
|---|---|
| `APP_ADMIN_BOOTSTRAP_ENABLED` | `true` |
| `APP_ADMIN_BOOTSTRAP_NOME` | o nome dela |
| `APP_ADMIN_BOOTSTRAP_EMAIL` | o e-mail que ela vai usar para entrar |
| `APP_ADMIN_BOOTSTRAP_SENHA` | a senha forte do §3 (**mínimo 12 caracteres**) |

Salve e espere reiniciar. Em **Deploy Logs** deve aparecer:

```
PRIMEIRO ADMINISTRADOR CRIADO: <o e-mail>
```

Entre no painel para confirmar: `https://catalogo-fm.vercel.app/admin`

### 🔴 Depois de entrar, apague as três variáveis

Volte na Railway e **remova** `APP_ADMIN_BOOTSTRAP_ENABLED`, `APP_ADMIN_BOOTSTRAP_EMAIL` e
`APP_ADMIN_BOOTSTRAP_SENHA`.

Elas guardam a senha em **texto puro** e não têm mais utilidade. Esquecer não reabre uma porta
(o bootstrap não sobrescreve admin existente), mas a senha ficaria à vista de qualquer pessoa
com acesso ao painel da Railway.

> ⚠️ **Nunca coloque essas credenciais em nenhum arquivo do projeto.** O `.gitignore` já bloqueia
> `.env`, mas a regra vale para qualquer lugar: senha de produção mora no painel da hospedagem e
> no seu gerenciador de senhas, nunca no Git.

---

## 9. Passo 6 — Testar tudo

Percorra na ordem. É o que uma cliente e sua irmã fariam.

### Health check
```
https://SEU-DOMINIO-RAILWAY/api/v1/actuator/health   →   {"status":"UP"}
```

### Login
1. Abra `https://SEU-SITE.vercel.app/admin`
2. Sem estar logada, deve **cair na tela de login**
3. Entre com o e-mail e a senha do §8 → deve abrir a lista de **Peças**
4. Teste também a senha errada → deve dizer "Credenciais inválidas"

### Cadastro de produto
1. **Categorias** → **Nova categoria** → nome (ex.: "Bodys") → **Salvar**
2. **Peças** → **Nova peça** → preencha nome, referência, preço, categoria, tamanhos
3. **Criar produto e continuar** → deve abrir a tela de edição

### Cloudinary (fotos e vídeos)
1. Na tela de edição do produto, seção de mídia → **Adicionar mídia**
   (ou arraste um arquivo do computador direto para a área)
2. A barra de progresso deve completar e a foto aparecer
3. Confirme em **https://cloudinary.com/console** → **Media Library** → pasta
   `frutodamalha/prod` → o arquivo está lá
4. Teste um vídeo também

> Se o upload falhar: as três variáveis `CLOUDINARY_*` na Railway precisam bater exatamente com o
> Dashboard do Cloudinary. Um espaço a mais já impede.

### Catálogo público
1. Abra `https://SEU-SITE.vercel.app` numa **aba anônima** (para garantir que não é cache seu)
2. O produto que você acabou de cadastrar deve estar lá, com a foto
3. Clique nele → a página abre com fotos, preço, tamanhos
4. Teste a busca e a navegação por categoria

### Carrinho (seleção)
1. Na página do produto, escolha quantidades em um ou mais tamanhos
2. **Adicionar à seleção** → o ícone no topo soma a quantidade
3. Clique no ícone → `/selecao`
4. Confira **subtotal por produto** e **total geral**
5. Altere uma quantidade → os valores recalculam na hora
6. Recarregue a página → a seleção continua lá (fica salva no navegador)

### WhatsApp
1. Na seleção, clique em **Enviar seleção pelo WhatsApp**
2. Deve abrir o WhatsApp com uma mensagem **já escrita**: cada produto com referência, tamanhos,
   quantidades, valor unitário, subtotal, e o total no fim
3. Nada é enviado sozinho — a cliente ainda aperta "Enviar"

### O teste que mais importa
> Altere o preço de um produto no painel → salve → recarregue o catálogo público na aba anônima →
> **o preço novo já está lá**, sem republicar nada.

---

## 10. Como ver os logs quando algo falhar

**Railway** (backend): abra o serviço → aba **Deployments** → clique no deploy → **View Logs**.
Há duas visões: *Build Logs* (a construção da imagem) e *Deploy Logs* (a aplicação rodando).
Erro de variável ou de banco aparece no **Deploy Logs**; erro de compilação, no **Build Logs**.

**Vercel** (frontend): **Deployments** → clique no deploy → **Building** mostra o log do build.
Para erros que acontecem com o site já no ar, aba **Logs** (ou **Runtime Logs**).

**Navegador** (o que a cliente vê): tecle `F12` → aba **Console** para erros de JavaScript e CORS;
aba **Network** para ver as chamadas à API e seus códigos de resposta.

---

## 11. Quando algo der errado

### O site abre mas nenhum produto carrega
`F12` → **Console**:
- **`blocked by CORS policy`** → `APP_CORS_ALLOWED_ORIGINS` na Railway não bate com o endereço do
  site. Confira letra por letra: `https://` sim, barra no final não.
- **chamadas indo para `localhost:8080`** → `NEXT_PUBLIC_API_URL` não estava configurada quando o
  site foi construído. Corrija na Vercel **e faça Redeploy**.

### O deploy da Vercel falha citando `NEXT_PUBLIC_SITE_URL` ou `NEXT_PUBLIC_API_URL`
Comportamento desejado, não bug: o build recusa publicar um site que não sabe o próprio endereço
ou o da API. Preencha e refaça o deploy.

### O deploy da Railway falha no health check
**Deploy Logs** → primeira linha com `ERROR`:
- `Could not resolve placeholder 'X'` → falta a variável `X`.
- `Connection refused` / `password authentication failed` → `DB_URL`, `DB_USERNAME` ou
  `DB_PASSWORD` errados. Verifique principalmente se o `DB_URL` **não** ficou com `usuario:senha@`
  no meio, e se termina em `?sslmode=require`.
- `APP_CORS_ALLOWED_ORIGINS não foi configurado` → exatamente isso.

### "A senha do primeiro administrador precisa ter pelo menos 12 caracteres"
Proposital. Use uma senha maior em `APP_ADMIN_BOOTSTRAP_SENHA`.

### Criei o admin mas o login diz "Credenciais inválidas"
O e-mail é gravado em minúsculas. Para recomeçar: **Neon** → **SQL Editor** → `DELETE FROM usuario;`
→ reative as variáveis de bootstrap.

### O primeiro acesso do dia demora alguns segundos
Normal — é o Neon acordando (§4).

### Sua irmã é desconectada sozinha
Esperado: o login vale 24 horas. É só entrar de novo.

---

## 12. Seu fluxo daqui para frente

```powershell
git add .
git commit -m "descrição do que mudou"
git push origin main
```

Vercel e Railway observam a branch `main` e reconstroem sozinhas, em paralelo. Dois a quatro
minutos depois está no ar, **no mesmo link**. Acompanhe pela aba *Deployments* de cada uma.

**A única exceção:** mudança em variável `NEXT_PUBLIC_*` não entra por push — precisa de
*Redeploy* manual na Vercel (§7).

### Testar antes de publicar

Todo push numa branch que **não** seja `main` gera um *preview* na Vercel, com endereço próprio,
sem tocar no catálogo das clientes:

```powershell
git checkout -b teste-alguma-coisa
git push -u origin teste-alguma-coisa
```

⚠️ O preview usa o **mesmo backend e o mesmo banco** da produção. Serve para conferir aparência e
navegação; **não** para testar algo que altere dados.

---

## 13. Domínio próprio (opcional, depois)

O sistema funciona perfeitamente em `.vercel.app`. Trocar é cosmético.

1. Registre o domínio (Registro.br para `.com.br`).
2. Vercel → **Settings** → **Domains** → **Add**.
3. A Vercel mostra os registros DNS para criar no painel do registrador. O HTTPS é emitido sozinho.
4. **Não esqueça:**
   - Vercel: `NEXT_PUBLIC_SITE_URL` = novo domínio → **e Redeploy**
   - Railway: `APP_CORS_ALLOWED_ORIGINS` = novo domínio

O backend não precisa de domínio próprio — ninguém digita o endereço dele.

---

## 14. Ambiente de staging (opcional, depois)

Não foi criado agora de propósito: dobraria os serviços a manter, e os previews da Vercel (§12) já
entregam a maior parte do benefício de graça.

Se um dia precisar testar mudanças que **alterem dados** sem tocar na produção: crie um *branch*
do banco no Neon (instantâneo), um segundo serviço na Railway apontando para a mesma branch do
GitHub com esse banco, e use o escopo **Preview** das variáveis da Vercel para apontar os previews
a esse backend.

---

## 15. Todas as variáveis

**Nunca escreva os valores em nenhum arquivo do repositório.**

### Railway — backend

| Variável | Obrigatória | Observação |
|---|:---:|---|
| `SPRING_PROFILES_ACTIVE` | ✅ | `prod` |
| `DB_URL` | ✅ | JDBC, com `?sslmode=require`, **sem** usuário/senha embutidos |
| `DB_USERNAME` | ✅ | |
| `DB_PASSWORD` | ✅ | |
| `APP_JWT_SECRET` | ✅ | ≥ 32 caracteres aleatórios |
| `APP_CORS_ALLOWED_ORIGINS` | ✅ | domínios do frontend, vírgula separa. `*` é recusado |
| `CLOUDINARY_CLOUD_NAME` | ✅ | |
| `CLOUDINARY_API_KEY` | ✅ | |
| `CLOUDINARY_API_SECRET` | ✅ | |
| `CLOUDINARY_BASE_FOLDER` | | padrão `frutodamalha`; sugerido `frutodamalha/prod` |
| `APP_JWT_EXPIRATION_MS` | | padrão `86400000` (24 h) |
| `DB_POOL_MAX` | | padrão `5` |
| `PORT` | 🚫 | **não definir** — a Railway injeta |
| `APP_ADMIN_BOOTSTRAP_*` | ⏳ | só no primeiro deploy; **remover depois** (§8) |

### Vercel — frontend

| Variável | Obrigatória | Observação |
|---|:---:|---|
| `NEXT_PUBLIC_API_URL` | ✅ | URL da Railway **+ `/api/v1`**, sem barra final |
| `NEXT_PUBLIC_SITE_URL` | ✅ | endereço do próprio site, sem barra final |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ✅ | só dígitos, com código do país |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | | rodapé — em branco oculta a linha |
| `NEXT_PUBLIC_EMAIL` | | idem |
| `NEXT_PUBLIC_TELEFONE` | | idem |
| `NEXT_PUBLIC_ENDERECO` | | idem |

Todas as `NEXT_PUBLIC_*` são embutidas no build: **mudou o valor → Redeploy.**

---

## 16. Custo

| Serviço | Plano | Custo |
|---|---|---|
| Vercel | Hobby | grátis |
| Neon | Free | grátis (suspende quando ocioso) |
| Cloudinary | Free | grátis até 25 GB de tráfego/mês |
| Railway | Trial → Hobby | ~US$ 5/mês após o crédito inicial |

A Railway é a única que cobra: é o serviço que precisa ficar ligado o tempo todo para a API
responder. Os outros três têm plano gratuito permanente que atende de sobra o volume da loja.
