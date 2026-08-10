# Deploy — como colocar o catálogo no ar

Guia operacional para publicar o Fruto da Malha na internet e mantê-lo lá.

Escrito para ser seguido por quem nunca fez um deploy. Todos os valores que você vai copiar e
colar são indicados; **nenhum segredo aparece neste arquivo** — eles ficam só nos painéis dos
serviços.

> **Para desenvolvimento local, este arquivo não serve.** Use o [README](../README.md), que
> explica como rodar tudo na sua máquina. Os dois ambientes convivem: publicar não tira nada do
> `localhost`.

---

## 1. O desenho

Quatro serviços gratuitos (ou quase), cada um cuidando de uma parte:

```
   Cliente / Administradora
            │
            ▼
   ┌──────────────────┐
   │     VERCEL       │   site em Next.js — o que as pessoas veem
   │  catálogo + /admin│
   └────────┬─────────┘
            │  chamadas à API
            ▼
   ┌──────────────────┐
   │     RAILWAY      │   API em Spring Boot — regras, login, banco
   └────┬────────┬────┘
        │        │
        ▼        ▼
   ┌────────┐ ┌────────────┐
   │  NEON  │ │ CLOUDINARY │
   │ Postgres│ │fotos/vídeos│
   └────────┘ └────────────┘
```

O **catálogo público** e o **painel** são o mesmo site na Vercel: o painel é só a rota `/admin`,
protegida por login. Um endereço só para divulgar; um caminho a mais que só sua irmã usa.

O Cloudinary você **já tem configurado** — as fotos vão do navegador direto para lá, sem passar
pelo servidor. Nada muda no deploy além de apontar as mesmas credenciais.

---

## 2. Antes de começar

Você vai precisar de:

- a conta do **GitHub** onde o projeto já está (`ArthurQueiroz23/Catalogo-FM`);
- as credenciais do **Cloudinary** que já usa localmente (`backend/.env`);
- **dois segredos novos**, que você gera agora e guarda num lugar seguro (um gerenciador de
  senhas, ou um papel na gaveta — não no WhatsApp, não no código):

**Segredo do JWT** — é o que assina os logins. Gere no PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Max 256 }))
```

**Senha da administradora** — a que sua irmã vai usar. Mínimo **12 caracteres**; a aplicação
recusa subir com menos, de propósito.

> ⏱️ O processo inteiro leva cerca de 40 minutos na primeira vez. Depois disso, publicar uma
> alteração é só `git push`.

---

## 3. Passo 1 — Banco de dados (Neon)

1. Acesse **https://neon.tech** e entre com a conta do GitHub.
2. **Create project**. Nome: `frutodamalha`. Região: escolha a mais próxima do Brasil
   (`AWS us-east-1` serve bem).
3. Terminada a criação, aparece a **connection string**. Ela tem esta forma:

   ```
   postgresql://USUARIO:SENHA@ep-alguma-coisa.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

4. **Guarde essa linha.** Vamos quebrá-la em três pedaços no próximo passo — o Java não usa esse
   formato direto.

> **Sobre o plano gratuito:** a Neon suspende o banco depois de ~5 minutos sem uso. O primeiro
> acesso depois de um período parado demora 1–3 segundos a mais, e só. A aplicação já está
> configurada para lidar com isso (`application-prod.yml`) — não é erro, e não precisa de ação.

---

## 4. Passo 2 — Backend (Railway)

### 4.1 Criar o serviço

1. Acesse **https://railway.app** e entre com o GitHub.
2. **New Project** → **Deploy from GitHub repo** → escolha `Catalogo-FM`.
   (Se o repositório não aparecer, clique em *Configure GitHub App* e libere o acesso a ele.)
3. Assim que o serviço for criado, abra **Settings** e ajuste:
   - **Root Directory**: `backend`
     
     ⚠️ **Este é o ajuste mais importante da página.** Sem ele, a Railway tenta construir o
     repositório inteiro, encontra o frontend junto e o build falha.
   - O restante pode ficar no padrão: a Railway lê o `railway.json` e o `Dockerfile` que já
     estão no projeto e sabe o que fazer.

### 4.2 Configurar as variáveis

Ainda no serviço, abra a aba **Variables** e adicione uma a uma. Os valores entre `< >` você
substitui.

| Variável | Valor |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | `jdbc:postgresql://<HOST>/<BANCO>?sslmode=require` |
| `DB_USERNAME` | o `USUARIO` da string da Neon |
| `DB_PASSWORD` | a `SENHA` da string da Neon |
| `APP_JWT_SECRET` | o segredo que você gerou no passo 2 |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:3000` *(provisório — corrigimos no passo 5)* |
| `CLOUDINARY_CLOUD_NAME` | o mesmo do seu `backend/.env` |
| `CLOUDINARY_API_KEY` | idem |
| `CLOUDINARY_API_SECRET` | idem |
| `CLOUDINARY_BASE_FOLDER` | `frutodamalha/prod` |

**Como montar o `DB_URL`.** Pegue a string da Neon e transforme assim:

```
Neon dá:  postgresql://maria:abc123@ep-frio-sol.us-east-1.aws.neon.tech/neondb?sslmode=require
                       └─┬──┘ └─┬──┘ └──────────────┬───────────────────┘ └──┬──┘
                     usuário  senha                host                     banco

DB_URL      = jdbc:postgresql://ep-frio-sol.us-east-1.aws.neon.tech/neondb?sslmode=require
DB_USERNAME = maria
DB_PASSWORD = abc123
```

Ou seja: troque `postgresql://` por `jdbc:postgresql://`, **tire o `usuario:senha@`** do meio e
mantenha o `?sslmode=require` no fim.

> ❗ **Não crie uma variável `PORT`.** A Railway injeta essa sozinha, e defini-la manualmente faz
> o contêiner escutar na porta errada e reprovar no health check.

### 4.3 Gerar o endereço público

1. **Settings** → seção **Networking** → **Generate Domain**.
2. A Railway devolve algo como `catalogo-fm-production.up.railway.app`. **Anote.**
3. Espere o deploy terminar (aba **Deployments**, status *Success*).
4. Confirme que subiu, abrindo no navegador:

   ```
   https://<seu-dominio-railway>/api/v1/actuator/health
   ```

   Deve aparecer `{"status":"UP"}`. Se aparecer, o backend e o banco estão conversando.

---

## 5. Passo 3 — Frontend (Vercel)

1. Acesse **https://vercel.com** e entre com o GitHub.
2. **Add New** → **Project** → importe `Catalogo-FM`.
3. Na tela de configuração:
   - **Root Directory**: clique em *Edit* e escolha `frontend`  ⚠️ (mesma armadilha da Railway)
   - **Framework Preset**: `Next.js` (a Vercel detecta sozinha)
4. Abra **Environment Variables** e adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<seu-dominio-railway>/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | deixe em branco por enquanto — preenchemos no passo 5 |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | o número da loja, só dígitos com código do país |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | o `@` da loja, sem o `@` |
| `NEXT_PUBLIC_EMAIL` | e-mail do rodapé |
| `NEXT_PUBLIC_TELEFONE` | telefone do rodapé |
| `NEXT_PUBLIC_ENDERECO` | endereço do rodapé |

   ⚠️ O `NEXT_PUBLIC_API_URL` **termina em `/api/v1`** e **não** tem barra no final.

5. **Deploy.** Ao terminar, a Vercel dá um endereço tipo `catalogo-fm.vercel.app`. **Anote.**

> O primeiro deploy provavelmente **vai falhar** com uma mensagem sobre `NEXT_PUBLIC_SITE_URL`.
> Isso é proposital — o sistema recusa publicar sem saber o próprio endereço, porque senão os
> links compartilhados no WhatsApp sairiam quebrados. O passo 5 resolve.

---

## 6. Passo 4 — Ligar as duas pontas

Agora que os dois endereços existem, cada lado precisa conhecer o outro.

**Na Vercel** (Settings → Environment Variables):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://catalogo-fm.vercel.app` *(o seu, sem barra final)* |

Depois: **Deployments** → nos três pontinhos do deploy mais recente → **Redeploy**.

> **Por que redeployar?** As variáveis `NEXT_PUBLIC_*` são gravadas dentro do site durante a
> construção, não lidas na hora do acesso. Salvar no painel não muda o site que já está no ar —
> só o próximo build. **Toda vez que mexer numa `NEXT_PUBLIC_*`, refaça o deploy.**

**Na Railway** (Variables), corrija:

| Variável | Valor |
|---|---|
| `APP_CORS_ALLOWED_ORIGINS` | `https://catalogo-fm.vercel.app,https://*-<seu-usuario>.vercel.app` |

A primeira parte é o site de verdade. A segunda libera os *previews* — endereços temporários que
a Vercel cria a cada alteração, para você conferir antes de publicar. Sem ela, os previews abrem
mas não carregam produto nenhum.

A Railway reinicia sozinha ao salvar.

---

## 7. Passo 5 — Criar o primeiro acesso da administradora

O banco nasce vazio e **não existe tela de cadastro** — o painel é de uso exclusivo da loja. O
primeiro acesso é criado uma única vez, por variável de ambiente.

**Na Railway**, adicione:

| Variável | Valor |
|---|---|
| `APP_ADMIN_BOOTSTRAP_ENABLED` | `true` |
| `APP_ADMIN_BOOTSTRAP_NOME` | o nome dela |
| `APP_ADMIN_BOOTSTRAP_EMAIL` | o e-mail que ela vai usar para entrar |
| `APP_ADMIN_BOOTSTRAP_SENHA` | a senha forte que você gerou (**mínimo 12 caracteres**) |

Salve e espere reiniciar. Na aba **Deploy Logs** deve aparecer:

```
PRIMEIRO ADMINISTRADOR CRIADO: <o e-mail>
```

Agora **entre no painel** para confirmar que funciona:

```
https://catalogo-fm.vercel.app/admin
```

### 🔴 Depois de entrar, apague as três variáveis

Volte na Railway e **remova** `APP_ADMIN_BOOTSTRAP_ENABLED`, `APP_ADMIN_BOOTSTRAP_EMAIL` e
`APP_ADMIN_BOOTSTRAP_SENHA`. Elas guardam a senha em texto puro e não têm mais nenhuma utilidade.

Se esquecer, o risco é limitado — o sistema **nunca** sobrescreve um administrador que já existe,
então a variável esquecida não reabre a porta. Mas a senha continuaria escrita ali à vista de
qualquer pessoa com acesso ao painel da Railway. Apague.

---

## 8. Passo 6 — Conferir se está tudo de pé

Percorra esta lista no navegador. É a mesma coisa que uma cliente e sua irmã fariam.

**Como cliente** (`https://catalogo-fm.vercel.app`):

- [ ] a home abre, com o fundo creme e o logo
- [ ] as categorias aparecem e abrem
- [ ] um produto abre e mostra as fotos
- [ ] o vídeo toca, se houver
- [ ] escolher tamanho e quantidade funciona
- [ ] "Adicionar à seleção" soma no ícone do topo
- [ ] a página `/selecao` mostra subtotal e total certos
- [ ] "Enviar pelo WhatsApp" abre a conversa com a mensagem pronta

**Como administradora** (`/admin`):

- [ ] `/admin` sem estar logada leva para o login
- [ ] o login entra
- [ ] criar uma categoria funciona
- [ ] criar um produto funciona
- [ ] adicionar uma foto funciona (o upload vai para o Cloudinary)
- [ ] adicionar um vídeo funciona
- [ ] editar o preço salva
- [ ] ocultar o produto tira ele do site
- [ ] "Sair" volta para o login

**O teste que mais importa** — é a promessa central do sistema:

> Altere o preço de um produto no painel → salve → abra o catálogo público numa aba anônima →
> **o preço novo já está lá**, sem esperar, sem republicar nada.

---

## 9. Como uma alteração chega em produção

Depois de configurado, é isto e nada mais:

```
você edita o código  →  git push  →  Vercel e Railway reconstroem sozinhas  →  no ar
```

Ambas observam a branch `main` do GitHub. Um push publica os dois lados em paralelo, sem
PowerShell, sem Docker, sem comando de deploy.

```powershell
git add .
git commit -m "descrição do que mudou"
git push
```

Dois a quatro minutos depois, está no ar. Acompanhe pela aba *Deployments* de cada serviço.

**A exceção:** mudanças em variáveis `NEXT_PUBLIC_*` **não** entram por push — exigem um
*Redeploy* manual na Vercel (§6).

---

## 10. Domínio próprio (quando quiser)

O sistema funciona perfeitamente nos endereços `.vercel.app` e `.up.railway.app`. Trocar por um
domínio próprio (`catalogo.frutodamalha.com.br`) é cosmético e pode esperar.

Quando decidir:

1. Registre o domínio (Registro.br, para `.com.br`).
2. Na Vercel: **Settings → Domains → Add**, informe o domínio.
3. A Vercel mostra os registros DNS a criar no painel do registrador. O certificado HTTPS é
   emitido sozinho.
4. **Não esqueça destes dois**, ou o site quebra de formas silenciosas:
   - Vercel: `NEXT_PUBLIC_SITE_URL` = o novo domínio → **e refaça o deploy**
   - Railway: `APP_CORS_ALLOWED_ORIGINS` = o novo domínio (mantenha o `.vercel.app` se ainda usa)

O backend **não precisa** de domínio próprio — ninguém digita o endereço dele.

---

## 11. Ambiente de teste (staging)

Não foi criado agora, de propósito: dobraria o número de serviços e variáveis para manter, e a
Vercel já entrega 90% do benefício de graça.

**O que você já tem sem configurar nada:** todo push numa branch que não seja a `main` gera um
*preview* na Vercel, com endereço próprio, sem tocar no catálogo das clientes.

```powershell
git checkout -b teste-alguma-coisa
git push -u origin teste-alguma-coisa
```

A Vercel comenta o endereço do preview no GitHub. O `APP_CORS_ALLOWED_ORIGINS` do §6 já libera
esses endereços.

⚠️ **A ressalva:** o preview aponta para o **mesmo backend e o mesmo banco** da produção. Serve
para testar aparência e navegação; **não** para testar algo que altere dados. Se um dia precisar
disso, o caminho é: criar um segundo banco na Neon (*branch* do banco, que é instantâneo), um
segundo serviço na Railway apontando para a mesma branch do GitHub, e usar a variável de ambiente
"Preview" da Vercel para apontar os previews a esse backend.

---

## 12. Quando algo der errado

### O site abre mas nenhum produto carrega
Quase sempre CORS ou URL da API.
1. Abra o site, tecle `F12` → aba **Console**.
2. Se disser `blocked by CORS policy`: o `APP_CORS_ALLOWED_ORIGINS` na Railway não bate com o
   endereço do site. Confira letra por letra — `https://` sim, barra no final não.
3. Se as chamadas forem para `localhost:8080`: o `NEXT_PUBLIC_API_URL` não estava configurado no
   momento do build. Corrija na Vercel **e refaça o deploy**.

### O deploy da Vercel falha citando `NEXT_PUBLIC_SITE_URL` ou `NEXT_PUBLIC_API_URL`
É o comportamento desejado, não um bug: o build recusa publicar um site que não sabe o próprio
endereço ou o da API. Preencha a variável e refaça o deploy.

### O deploy da Railway falha no health check
1. **Deploy Logs** → procure a primeira linha com `ERROR`.
2. `Could not resolve placeholder` → falta uma variável de ambiente com esse nome.
3. `Connection refused` / `password authentication failed` → `DB_URL`, `DB_USERNAME` ou
   `DB_PASSWORD` errados. Confira principalmente se o `DB_URL` **não** ficou com o
   `usuario:senha@` no meio (§4.2).
4. `APP_CORS_ALLOWED_ORIGINS não foi configurado` → exatamente isso; a aplicação recusa subir
   sem saber quem pode chamá-la.

### "A senha do primeiro administrador precisa ter pelo menos 12 caracteres"
Proposital. Escolha uma senha maior e atualize `APP_ADMIN_BOOTSTRAP_SENHA`.

### Criei o admin mas o login diz "Credenciais inválidas"
Confira o e-mail — ele é gravado em minúsculas. Se precisar recomeçar: apague o usuário pela
console SQL da Neon (`DELETE FROM usuario;`) e reative as variáveis de bootstrap.

### O primeiro acesso do dia demora alguns segundos
Normal. É a Neon acordando o banco (§3). Só no primeiro acesso após um período parado.

### Sua irmã é desconectada sozinha depois de um tempo
Esperado: o login vale 24 horas (`APP_JWT_EXPIRATION_MS`). É só entrar de novo.

---

## 13. Todas as variáveis, em um lugar

**Nunca escreva os valores neste arquivo nem em qualquer outro do repositório.**

### Railway — backend

| Variável | Obrigatória | Observação |
|---|:---:|---|
| `SPRING_PROFILES_ACTIVE` | ✅ | `prod` |
| `DB_URL` | ✅ | JDBC, com `?sslmode=require`, sem usuário/senha embutidos |
| `DB_USERNAME` | ✅ | |
| `DB_PASSWORD` | ✅ | |
| `APP_JWT_SECRET` | ✅ | ≥ 32 caracteres aleatórios |
| `APP_CORS_ALLOWED_ORIGINS` | ✅ | domínios do frontend, separados por vírgula. `*` é recusado |
| `CLOUDINARY_CLOUD_NAME` | ✅ | |
| `CLOUDINARY_API_KEY` | ✅ | |
| `CLOUDINARY_API_SECRET` | ✅ | |
| `CLOUDINARY_BASE_FOLDER` | | padrão `frutodamalha`; sugerido `frutodamalha/prod` |
| `APP_JWT_EXPIRATION_MS` | | padrão `86400000` (24 h) |
| `DB_POOL_MAX` | | padrão `5` |
| `PORT` | 🚫 | **não definir** — a Railway injeta |
| `APP_ADMIN_BOOTSTRAP_*` | ⏳ | só no primeiro deploy; **remover depois** (§7) |

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

Todas as `NEXT_PUBLIC_*` são embutidas no build: **mudou o valor, refaça o deploy.**

---

## 14. Custo

| Serviço | Plano | Custo |
|---|---|---|
| Vercel | Hobby | grátis |
| Neon | Free | grátis (suspende quando ocioso) |
| Cloudinary | Free | grátis até 25 GB de tráfego/mês |
| Railway | Trial → Hobby | ~US$ 5/mês depois do crédito inicial |

A Railway é a única que cobra. É o serviço que precisa ficar ligado o tempo todo para a API
responder — os outros três têm plano gratuito permanente que atende de sobra o volume da loja.
