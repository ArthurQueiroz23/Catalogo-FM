# Fruto da Malha — Catálogo Online

Sistema web completo para substituir o catálogo em PDF da Fruto da Malha (roupas infantis) por
um catálogo online moderno, com painel administrativo e carrinho de pedidos integrado ao
WhatsApp — **sem nenhum processamento de pagamento dentro do sistema**.

> **Este é um projeto de longo prazo, construído em várias sessões de desenvolvimento.**
> Se você é a próxima pessoa (ou IA) a continuar o desenvolvimento, leia
> **[docs/PROGRESS.md](docs/PROGRESS.md)** antes de tudo — ele diz exatamente o que já foi feito,
> o que falta e qual é o próximo passo.

Este README, por outro lado, é um **tutorial passo a passo para quem nunca programou**: como
instalar tudo, rodar o projeto na sua máquina e usar o sistema pela primeira vez. Todos os
comandos podem ser copiados e colados exatamente como estão.

---

## Índice

1. [O que precisa estar instalado](#1-o-que-precisa-estar-instalado)
2. [Como clonar o projeto](#2-como-clonar-o-projeto)
3. [Como abrir no VS Code](#3-como-abrir-no-vs-code)
4. [Como instalar as dependências](#4-como-instalar-as-dependências)
5. [Como configurar o arquivo .env](#5-como-configurar-o-arquivo-env)
6. [Como iniciar o backend](#6-como-iniciar-o-backend)
7. [Como iniciar o frontend](#7-como-iniciar-o-frontend)
8. [Como acessar o sistema no navegador](#8-como-acessar-o-sistema-no-navegador)
9. [Como acessar o Swagger](#9-como-acessar-o-swagger)
10. [Como acessar o painel administrativo](#10-como-acessar-o-painel-administrativo)
11. [Como fazer login](#11-como-fazer-login)
12. [Como cadastrar categorias](#12-como-cadastrar-categorias)
13. [Como cadastrar produtos](#13-como-cadastrar-produtos)
14. [Como enviar imagens](#14-como-enviar-imagens)
15. [Como testar o carrinho](#15-como-testar-o-carrinho)
16. [Como testar a integração com WhatsApp](#16-como-testar-a-integração-com-whatsapp)
17. [Como gerar um build para produção](#17-como-gerar-um-build-para-produção)
18. [Como resolver os erros mais comuns](#18-como-resolver-os-erros-mais-comuns)

---

## Antes de começar: como o sistema é organizado

O projeto tem três partes que rodam separadamente, cada uma na sua "janela" de terminal:

| Parte | O que é | Onde roda |
|---|---|---|
| **Banco de dados** | Onde ficam guardados produtos, categorias, etc. | PostgreSQL, via Docker |
| **Backend** | O "cérebro" do sistema — API que guarda e devolve os dados | Java + Spring Boot, porta `8080` |
| **Frontend** | O site que o cliente e a administradora enxergam | Next.js (React), porta `3000` |

Você vai precisar de **três terminais abertos ao mesmo tempo** rodando: o banco de dados, o
backend e o frontend. Isso é normal — cada um fica "escutando" a sua porta o tempo todo enquanto
você usa o sistema.

---

## 1. O que precisa estar instalado

Instale, nesta ordem, **antes** de fazer qualquer outra coisa. Depois de instalar qualquer um
destes programas, **feche e abra o terminal de novo** (ou reinicie o computador, se tiver
dúvida) — programas recém-instalados só aparecem em terminais abertos depois da instalação.

### 1.1 Git

Controla as versões do código-fonte.

- Baixe em: https://git-scm.com/downloads
- Durante a instalação no Windows, pode deixar todas as opções no padrão (clicar "Next" até o fim).
- Para conferir se instalou certo, abra o **PowerShell** e rode:
  ```powershell
  git --version
  ```
  Deve aparecer algo como `git version 2.4x.x`.

### 1.2 Java 21 (JDK)

O backend é escrito em Java e precisa da versão **21** especificamente (não funciona com
versões mais antigas, tipo Java 8 ou 11).

- Baixe o **Eclipse Temurin 21** (distribuição gratuita e recomendada do Java) em:
  https://adoptium.net/temurin/releases/?version=21
- Escolha o instalador `.msi` para Windows x64.
- Durante a instalação, marque a opção **"Set JAVA_HOME variable"** e **"Add to PATH"**, se
  aparecerem — isso evita configuração manual depois.
- Para conferir:
  ```powershell
  java -version
  ```
  Deve aparecer `openjdk version "21...`.

### 1.3 Maven

Ferramenta que baixa as bibliotecas do backend e compila o projeto Java.

- Baixe o arquivo **Binary zip archive** em: https://maven.apache.org/download.cgi
- Extraia o `.zip` em uma pasta fixa, por exemplo `C:\ferramentas\apache-maven-3.9.x`.
- Adicione a pasta `bin` dessa pasta ao PATH do Windows:
  1. Pesquise por "Variáveis de ambiente" no menu Iniciar → "Editar as variáveis de ambiente do sistema".
  2. Clique em "Variáveis de Ambiente...".
  3. Em "Variáveis do usuário", selecione `Path` → "Editar" → "Novo".
  4. Cole o caminho completo, por exemplo `C:\ferramentas\apache-maven-3.9.x\bin`.
  5. Confirme em todas as janelas com "OK".
- Para conferir (em um terminal **novo**):
  ```powershell
  mvn -v
  ```
  Deve mostrar a versão do Maven e do Java 21 que ele está usando.

  > **Alternativa mais simples:** o projeto já inclui um "Maven Wrapper" (`backend/mvnw.cmd`),
  > que baixa e usa o Maven certo sozinho — nesse caso você só precisa do Java 21 instalado, e
  > troca `mvn` por `.\mvnw.cmd` nos comandos deste README (rodando de dentro da pasta `backend`).

### 1.4 Node.js

O frontend é escrito em JavaScript/TypeScript e roda sobre o Node.js.

- Baixe a versão **LTS** (recomendada) em: https://nodejs.org — qualquer versão 20 ou mais nova
  funciona; este projeto foi testado com a versão 24.
- O instalador do Windows já inclui o `npm` (gerenciador de pacotes) junto.
- Para conferir:
  ```powershell
  node -v
  npm -v
  ```

### 1.5 Docker Desktop (para o banco de dados)

O jeito mais simples de ter um PostgreSQL rodando localmente, sem instalar e configurar um banco
de dados "na unha".

- Baixe em: https://www.docker.com/products/docker-desktop/
- Depois de instalar, abra o aplicativo **Docker Desktop** uma vez e espere ele terminar de
  iniciar (ícone da baleia fica parado, sem animação, na bandeja do Windows).
- Para conferir:
  ```powershell
  docker --version
  ```

### 1.6 Um editor de código: VS Code

- Baixe em: https://code.visualstudio.com/

### Resumo — o que você precisa ter rodando os comandos de verificação sem erro

```powershell
git --version
java -version
mvn -v
node -v
npm -v
docker --version
```

Se algum desses comandos disser "não é reconhecido como um comando..." (`is not recognized`),
volte no passo daquele programa — geralmente é o PATH que não foi configurado, ou o terminal
que precisa ser reaberto.

---

## 2. Como clonar o projeto

"Clonar" é baixar uma cópia do código-fonte do repositório Git para o seu computador.

1. Escolha uma pasta onde guardar o projeto, por exemplo `C:\Projetos`.
2. Abra o PowerShell nessa pasta (clique com o botão direito dentro da pasta no Explorador de
   Arquivos → "Abrir no Terminal", ou navegue até lá com `cd`).
3. Rode (troque a URL pela URL real do repositório do projeto):
   ```powershell
   git clone <URL-DO-REPOSITORIO> frutodamalha
   cd frutodamalha
   ```
4. Se o projeto já estiver na sua máquina (por exemplo, você recebeu a pasta pronta em vez de
   clonar), pule esta etapa e apenas abra um terminal dentro da pasta do projeto.

Ao final, você deve ter uma pasta `frutodamalha` com esta estrutura:

```
frutodamalha/
├── backend/     # API em Spring Boot (Java)
├── frontend/    # Site em Next.js (React)
└── docs/        # Documentação do projeto
```

---

## 3. Como abrir no VS Code

1. Abra o VS Code.
2. Menu **File → Open Folder...** (Arquivo → Abrir Pasta...).
3. Selecione a pasta `frutodamalha` (a pasta raiz, que contém `backend/`, `frontend/` e `docs/`).
4. Na primeira vez, o VS Code pode sugerir instalar extensões recomendadas (Java, ESLint,
   Tailwind CSS...) — aceite, elas ajudam bastante.
5. Use o menu **Terminal → New Terminal** (ou `` Ctrl+` ``) para abrir terminais integrados
   dentro do VS Code — é mais prático que alternar entre janelas.

> Dica: como você vai precisar de até três terminais abertos ao mesmo tempo (banco, backend,
> frontend), no VS Code dá pra abrir vários terminais lado a lado clicando no ícone de "split"
> (dividir) no canto do painel de terminal.

---

## 4. Como instalar as dependências

"Dependências" são as bibliotecas de código que o projeto usa por baixo dos panos. Cada parte do
projeto (backend e frontend) tem as suas.

### Backend

O Maven baixa as dependências automaticamente na primeira vez que você compilar ou rodar o
projeto — não existe um comando separado de "instalar". O primeiro comando do
[passo 6](#6-como-iniciar-o-backend) já faz isso (pode demorar alguns minutos na primeira vez,
enquanto baixa tudo da internet).

Se quiser forçar esse download antes, sem rodar a aplicação:

```powershell
cd backend
mvn dependency:go-offline
```

### Frontend

```powershell
cd frontend
npm install
```

Isso cria uma pasta `frontend/node_modules` com todas as bibliotecas (pode demorar 1–2 minutos).
Você só precisa rodar `npm install` de novo se o arquivo `frontend/package.json` mudar (por
exemplo, depois de um `git pull` que trouxe uma dependência nova).

---

## 5. Como configurar o arquivo `.env`

Um arquivo `.env` guarda configurações e senhas que **não podem** ir para o Git (para não vazar
segredos publicamente). Por isso o projeto tem um arquivo de exemplo (`.env.example`) que você
copia e preenche com seus próprios valores.

### 5.1 Banco de dados (Docker)

Antes de configurar o `.env`, suba o banco de dados PostgreSQL local. Com o Docker Desktop
aberto, rode em qualquer terminal:

```powershell
docker run --name frutodamalha-db -e POSTGRES_USER=frutodamalha -e POSTGRES_PASSWORD=frutodamalha -e POSTGRES_DB=frutodamalha -p 5432:5432 -d postgres:16-alpine
```

Isso cria e inicia um container Postgres. Nas próximas vezes, **não rode esse comando de novo**
— apenas inicie o container já criado:

```powershell
docker start frutodamalha-db
```

(E, se quiser parar o banco: `docker stop frutodamalha-db`.)

### 5.2 Backend

```powershell
cd backend
copy .env.example .env
```

Abra o arquivo `backend\.env` recém-criado no VS Code e preencha:

```dotenv
SPRING_PROFILES_ACTIVE=dev

DB_URL=jdbc:postgresql://localhost:5432/frutodamalha
DB_USERNAME=frutodamalha
DB_PASSWORD=frutodamalha

APP_JWT_SECRET=troque-isto-por-qualquer-texto-longo-e-aleatorio-com-32-caracteres-ou-mais
APP_JWT_EXPIRATION_MS=86400000

APP_CORS_ALLOWED_ORIGINS=http://localhost:3000

CLOUDINARY_CLOUD_NAME=seu-cloud-name-aqui
CLOUDINARY_API_KEY=sua-api-key-aqui
CLOUDINARY_API_SECRET=seu-api-secret-aqui
CLOUDINARY_BASE_FOLDER=frutodamalha

PORT=8080
```

- `DB_URL`/`DB_USERNAME`/`DB_PASSWORD`: se você usou o comando Docker acima sem alterar nada,
  pode deixar exatamente como está no exemplo.
- `APP_JWT_SECRET`: qualquer frase longa serve para desenvolvimento local — só precisa ter pelo
  menos uns 32 caracteres. **Nunca** use um valor fraco em produção.
- `CLOUDINARY_*`: crie uma conta gratuita em https://cloudinary.com, entre no **Dashboard** e
  copie os valores de "Cloud name", "API Key" e "API Secret" exatamente como aparecem lá.

Você **não** precisa instalar nada nem "carregar" esse `.env` manualmente — o backend já lê esse
arquivo sozinho assim que inicia (ver `docs/ARCHITECTURE.md` se tiver curiosidade em como isso
funciona). Só precisa existir, preenchido, dentro da pasta `backend/`.

### 5.3 Frontend

```powershell
cd frontend
copy .env.example .env.local
```

Abra `frontend\.env.local` e preencha:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WHATSAPP_NUMBER=5581999999999
NEXT_PUBLIC_INSTAGRAM_HANDLE=frutodamalha
```

- `NEXT_PUBLIC_API_URL`: endereço do backend — em desenvolvimento local, deixe exatamente como
  está acima.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: número de WhatsApp da vendedora, **com código do país e DDD,
  só números** (sem `+`, espaço ou traço). Exemplo: um número (81) 99999-9999 vira `5581999999999`.
- `NEXT_PUBLIC_INSTAGRAM_HANDLE`: o `@usuario` do Instagram da loja, sem o `@`.

---

## 6. Como iniciar o backend

Com o banco de dados rodando (passo 5.1) e o `.env` preenchido (passo 5.2):

```powershell
cd backend
mvn spring-boot:run
```

(Ou `.\mvnw.cmd spring-boot:run`, se estiver usando o Maven Wrapper em vez do Maven instalado.)

Na primeira vez, isso vai demorar um pouco (baixando dependências + criando as tabelas do banco
automaticamente via **Flyway**). Você vai saber que deu certo quando aparecer no final algo como:

```
Tomcat started on port 8080 (http) with context path '/api/v1'
Started CatalogoApplication in X.XXX seconds
```

**Deixe esse terminal aberto** — o backend fica rodando ali. Para parar, clique dentro do
terminal e pressione `Ctrl+C`.

Em ambiente de desenvolvimento, o backend cria automaticamente um usuário administrador padrão
na primeira vez que sobe (se ainda não existir nenhum usuário no banco) — as credenciais estão
no [passo 11](#11-como-fazer-login).

---

## 7. Como iniciar o frontend

Em um **novo terminal** (deixe o do backend aberto):

```powershell
cd frontend
npm run dev
```

Você vai ver algo como:

```
▲ Next.js 16.3.0 (Turbopack)
- Local: http://localhost:3000
✓ Ready in X.Xs
```

**Deixe esse terminal aberto** também. Para parar, `Ctrl+C`.

---

## 8. Como acessar o sistema no navegador

Com backend (porta 8080) e frontend (porta 3000) rodando, abra o navegador em:

```
http://localhost:3000
```

Essa é a **área pública** — a home do catálogo, exatamente como um cliente veria. No começo ela
vai aparecer vazia ("O catálogo ainda não tem produtos cadastrados"), porque ainda não
cadastramos nada — isso é esperado, vamos resolver nos próximos passos.

---

## 9. Como acessar o Swagger

O Swagger é uma página que lista todos os endpoints da API do backend e deixa testá-los
diretamente pelo navegador, sem precisar do frontend — útil para conferir que o backend está
funcionando, ou para testar algo pontual.

Com o backend rodando, acesse:

```
http://localhost:8080/api/v1/swagger-ui.html
```

Para testar um endpoint protegido (que exige login), primeiro faça login pelo endpoint
`POST /auth/login` ali mesmo no Swagger, copie o `token` da resposta, clique no botão
**"Authorize"** no topo da página e cole o token (sem a palavra `Bearer`, o próprio Swagger já
adiciona).

---

## 10. Como acessar o painel administrativo

Com o frontend rodando, acesse:

```
http://localhost:3000/admin/login
```

Você vai ver a tela de login do painel — diferente da área pública, aqui é onde a
administradora cadastra categorias, produtos, etc.

---

## 11. Como fazer login

Em **desenvolvimento local**, um usuário administrador é criado automaticamente na primeira vez
que o backend sobe (ver `backend/src/main/resources/application-dev.yml`):

- **E-mail:** `admin@frutodamalha.com.br`
- **Senha:** `admin123`

Digite essas credenciais na tela de login. Depois de entrar, você cai no **Dashboard** do painel,
com sidebar de navegação à esquerda (Dashboard, Produtos, Categorias, Coleções, Tamanhos).

> ⚠️ Essas credenciais são só para desenvolvimento local — o backend nunca cria esse usuário
> automaticamente em produção. Ver `docs/PROGRESS.md` para o processo de criar o primeiro admin
> real antes de colocar o sistema no ar para a cliente de verdade.

---

## 12. Como cadastrar categorias

As categorias organizam os produtos (Macacão Curto, Body, Vestidos, etc.) e são a base de tudo
— cadastre pelo menos uma antes de cadastrar produtos, já que todo produto exige uma categoria.

1. No painel, clique em **Categorias** na sidebar.
2. Clique no botão **"Nova categoria"**.
3. Preencha o **Nome** (ex.: "Macacão Curto") — o restante é opcional:
   - **Descrição**: texto livre, aparece na página da categoria.
   - **Imagem de capa**: clique em "Enviar imagem" para subir uma foto (ver
     [passo 14](#14-como-enviar-imagens) sobre como o envio de imagens funciona).
   - **Categoria ativa**: deixe ligado para a categoria aparecer no site público.
4. Clique em **Salvar**.

A categoria aparece na lista, e você pode arrastá-la (pelo ícone de pontos à esquerda) para
mudar a ordem em que as categorias aparecem na home do site.

---

## 13. Como cadastrar produtos

1. No painel, clique em **Produtos** → **"Novo produto"**.
2. Preencha os campos:
   - **Nome**: nome do produto, ex. "Macacão Curto Dino".
   - **Referência**: o código do produto — o mesmo tipo de código que já era usado no catálogo
     em PDF (ex. `000180`). Esse código aparece na URL do produto e na mensagem de pedido do
     WhatsApp, então escolha algo curto e sem espaços.
   - **Descrição**, **Preço**, **Categoria** (obrigatória), **Coleção** (opcional), **Tecido**,
     **Sexo**, **Status** (Ativo = aparece no site; Oculto = fica escondido, mas continua
     existindo no painel).
   - **Tamanhos disponíveis**: clique nos tamanhos que esse produto tem (ex. P, M, G).
   - **Observações**, **Destaque** (aparece na home) e **Lançamento** (aparece na home).
3. Clique em **"Criar produto e continuar"**.

Depois de criar, você é levada automaticamente para a tela de edição do mesmo produto — é ali
que aparece a seção de **fotos e vídeos** (só é possível adicionar fotos depois que o produto já
existe, ver próximo passo).

Para editar um produto depois, vá em **Produtos**, encontre o produto na lista e clique no ícone
de lápis. Na mesma listagem você também pode: ocultar/ativar (ícone de olho), duplicar (ícone de
cópia — cria uma cópia do produto sem as fotos, útil para uma peça parecida) e excluir (ícone de
lixeira — a exclusão é reversível no banco de dados, mas o produto some do site e do painel).

---

## 14. Como enviar imagens

Dentro da tela de edição de um produto (depois de criado), role até a seção **"Fotos"**:

1. Clique em **"Adicionar fotos"** e escolha uma ou mais imagens do seu computador (você pode
   selecionar várias de uma vez).
2. Espere a barra de progresso terminar — cada imagem é enviada diretamente para o Cloudinary
   (o servidor do backend nunca recebe o arquivo, só uma autorização temporária de upload).
3. A primeira foto enviada vira automaticamente a **imagem principal** (a que aparece nas
   listagens do site) — marcada com uma estrelinha. Para trocar qual foto é a principal, passe o
   mouse sobre outra foto e clique no ícone de estrela que aparece.
4. Para reordenar as fotos, arraste-as pela galeria (a ordem se reflete no carrossel da página
   do produto).
5. Para remover uma foto, passe o mouse sobre ela e clique no ícone de lixeira.

A seção **"Vídeos"** logo abaixo funciona do mesmo jeito para vídeos (sem reordenação, já que
normalmente há só um ou dois vídeos por produto).

> Isso só funciona se as credenciais do Cloudinary (`CLOUDINARY_*`) estiverem certas no
> `backend/.env` — ver [passo 5.2](#52-backend) e o [passo 18](#18-como-resolver-os-erros-mais-comuns)
> se der erro.

---

## 15. Como testar o carrinho

Esta é a parte mais importante do site para o cliente final — teste como se você fosse uma
cliente comprando:

1. Acesse `http://localhost:3000` e clique em um produto (ou use a busca no topo).
2. Na página do produto, escolha a quantidade desejada para um ou mais tamanhos (ex.: P → 2,
   M → 3) usando os botões de `+`/`−`.
3. Clique em **"Adicionar ao carrinho"**.
4. Clique no ícone de sacola no topo da página (ele mostra a quantidade total de peças no
   carrinho) para ir até `/carrinho`.
5. No carrinho, confira que aparecem: a imagem do produto, o nome, a referência, os tamanhos
   escolhidos com suas quantidades, o subtotal daquele produto, e — no resumo à direita — a
   quantidade total de peças e o valor total do pedido.
6. Teste alterar uma quantidade (o subtotal e o total devem recalcular na hora), remover um
   produto do carrinho e o botão "Limpar carrinho".

---

## 16. Como testar a integração com WhatsApp

Com pelo menos um produto no carrinho:

1. Na tela do carrinho, clique no botão verde **"Finalizar Pedido pelo WhatsApp"**.
2. Isso abre o WhatsApp Web (ou o aplicativo, se estiver no celular) já com uma conversa aberta
   para o número configurado em `NEXT_PUBLIC_WHATSAPP_NUMBER`, e uma mensagem **pré-preenchida**
   contendo: cada produto com referência, nome, tamanhos e quantidades, valor unitário e
   subtotal — e no final, a quantidade total de peças e o valor total do pedido.
3. Nada é enviado automaticamente — a cliente ainda precisa apertar "Enviar" dentro do próprio
   WhatsApp. O sistema só monta a mensagem; a partir daí a conversa (incluindo o pagamento)
   acontece inteiramente fora do site, diretamente com a vendedora.

Se o número em `NEXT_PUBLIC_WHATSAPP_NUMBER` não for um número de WhatsApp válido/ativo, o
WhatsApp Web vai abrir mas mostrar um aviso de número inválido — isso é esperado ao testar com
um número de exemplo; troque pelo número real da loja antes de ir para produção.

---

## 17. Como gerar um build para produção

"Build de produção" é a versão otimizada e compilada do sistema, pronta para rodar num servidor
de verdade (diferente do modo `dev`, que é mais lento mas facilita o desenvolvimento).

### Backend

```powershell
cd backend
mvn clean package
```

Isso gera um arquivo `.jar` executável em `backend\target\catalogo.jar`. Para rodar esse jar
diretamente (simulando produção):

```powershell
java -jar target\catalogo.jar
```

Em produção de verdade (Railway), as variáveis de ambiente (`DB_URL`, `APP_JWT_SECRET`, etc.) são
configuradas direto no painel da Railway, não em um arquivo `.env` — ver `docs/PROGRESS.md` e
`docs/ARCHITECTURE.md` §4 para o passo a passo de deploy (ainda pendente neste projeto).

### Frontend

```powershell
cd frontend
npm run build
```

Isso gera a pasta `frontend\.next` otimizada. Para rodar essa versão localmente (sem o modo
`dev`):

```powershell
npm run start
```

Em produção de verdade, o build é feito automaticamente pela Vercel a cada `git push`, lendo as
variáveis de ambiente (`NEXT_PUBLIC_*`) configuradas no painel da Vercel.

---

## 18. Como resolver os erros mais comuns

### `'mvn' não é reconhecido como um comando interno ou externo`
O Maven não está no PATH do Windows, ou o terminal foi aberto antes de você configurar o PATH.
Revise o [passo 1.3](#13-maven), depois **feche todos os terminais e abra um novo**.

### `'node' não é reconhecido...` / `'java' não é reconhecido...`
Mesma causa do erro acima, para Node.js ou Java — revise a instalação e reabra o terminal.

### O backend não sobe e aparece `Could not resolve placeholder 'APP_JWT_SECRET'`
O arquivo `backend\.env` não existe, está vazio, ou não está na pasta certa. Ele precisa estar
exatamente em `backend\.env` (mesma pasta do `pom.xml`), com o valor de `APP_JWT_SECRET`
preenchido — revise o [passo 5.2](#52-backend).

### O backend não sobe e aparece `Connection to localhost:5432 refused`
O banco de dados PostgreSQL não está rodando. Confira se o Docker Desktop está aberto e rode:
```powershell
docker start frutodamalha-db
```
Se o container ainda não existe, volte ao [passo 5.1](#51-banco-de-dados-docker).

### `Port 8080 was already in use` (ou `porta 3000` no frontend)
Já existe algo rodando naquela porta — provavelmente uma instância anterior do backend/frontend
que não foi fechada direito. Encontre e feche o processo:
```powershell
# Descobre o PID (número do processo) usando a porta 8080
netstat -ano | findstr :8080
# Encerra o processo (troque 1234 pelo PID encontrado acima)
taskkill /PID 1234 /F
```
Ou simplesmente reinicie o computador, se preferir o caminho mais simples.

### A tela de login mostra "Credenciais inválidas"
Confira se está usando exatamente `admin@frutodamalha.com.br` / `admin123` (ver
[passo 11](#11-como-fazer-login)). Se o banco de dados já tinha algum usuário cadastrado antes
(por exemplo, você recriou o container do banco do zero mas o `application-dev.yml` só cria o
admin padrão **se não existir nenhum usuário**), pode ser necessário recriar o container do
banco (`docker rm -f frutodamalha-db` e repetir o [passo 5.1](#51-banco-de-dados-docker)) para
que o admin padrão seja recriado.

### O site em `localhost:3000` carrega, mas nada aparece e o console do navegador mostra erro de rede
O frontend não está conseguindo falar com o backend. Confira, nesta ordem:
1. O backend está mesmo rodando (terminal do [passo 6](#6-como-iniciar-o-backend) sem erros)?
2. `NEXT_PUBLIC_API_URL` em `frontend\.env.local` está exatamente
   `http://localhost:8080/api/v1`?
3. Depois de editar `.env.local`, você **precisa reiniciar** o `npm run dev` (variáveis
   `NEXT_PUBLIC_*` só são lidas quando o servidor inicia).

### Erro de CORS no console do navegador (`blocked by CORS policy`)
`APP_CORS_ALLOWED_ORIGINS` em `backend\.env` não bate com o endereço de onde o frontend está
rodando. Em desenvolvimento local deve ser exatamente `http://localhost:3000` (sem barra no
final). Depois de corrigir, reinicie o backend.

### Upload de foto/vídeo falha com algum erro do Cloudinary
Confira se `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` em
`backend\.env` estão exatamente iguais ao que aparece no Dashboard da sua conta Cloudinary
(https://cloudinary.com/console) — um espaço a mais ou um valor trocado já impede o upload.
Reinicie o backend depois de corrigir.

### Fiz login mas depois de um tempo o painel me joga de volta pro login sozinho
O token de acesso (JWT) expira depois de um tempo (24 horas por padrão,
`APP_JWT_EXPIRATION_MS`) — é só fazer login de novo. Isso não é um erro, é esperado.

### `npm run lint` ou `npm run type-check` (ou o build) acusam erro depois que eu editei algum arquivo
Leia a mensagem de erro com calma — o TypeScript e o ESLint são bem específicos sobre o que
esperam (nome de arquivo, linha, e geralmente até uma sugestão de correção). Se for algo que
você não mexeu, confira se salvou todos os arquivos e se não há chaves `{}` ou parênteses `()`
faltando em algo que foi editado por último.

### Nada do que tentei funcionou
Confira se todos os comandos do [passo 1](#1-o-que-precisa-estar-instalado) rodam sem erro,
**nessa ordem**, do zero, num terminal novo. A grande maioria dos problemas de "ambiente" some
quando se confirma que Git, Java, Maven, Node e Docker estão instalados e no PATH corretamente.

---

## Documentação adicional

| Documento | Conteúdo |
|---|---|
| [docs/PROGRESS.md](docs/PROGRESS.md) | Checklist vivo de progresso do projeto |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Decisões de arquitetura, stack, estrutura de pastas |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Modelo de dados (ER), entidades e relacionamentos |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | Contrato de endpoints REST (backend ↔ frontend) |

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, TailwindCSS, React Query, Zustand,
  React Hook Form + Zod, @dnd-kit — deploy na Vercel
- **Backend:** Spring Boot 3, Java 21, Spring Security + JWT, MapStruct, Flyway — deploy no Railway
- **Banco:** PostgreSQL — Neon (produção) / Docker local (desenvolvimento)
- **Storage:** Cloudinary (imagens e vídeos dos produtos, upload direto do navegador)

## Licença

Projeto privado — uso comercial exclusivo da Fruto da Malha.
