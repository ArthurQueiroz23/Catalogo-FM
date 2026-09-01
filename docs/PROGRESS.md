# Progresso do Projeto — Fruto da Malha Catálogo

> **Leia este arquivo primeiro em toda nova sessão.** Ele é a fonte da verdade sobre onde o
> projeto parou. Depois de ler, confira também `docs/ARCHITECTURE.md` (decisões técnicas),
> `docs/DATABASE_SCHEMA.md` (modelo de dados) e `docs/API_CONTRACT.md` (contrato de endpoints).

Última atualização: **2026-09-01** — Sessão 7 (limpeza de textos e observação por peça no carrinho).

---

## Changelog da sessão 7 (2026-09-01) — limpeza de textos e observação por peça no carrinho

Duas frentes pedidas pelo dono do projeto: **tirar da interface quatro textos que ele não quis
manter** e **deixar a cliente escrever um recado para cada peça** da seleção.

### Alterações visuais — o que saiu da interface

| O que saiu | Onde estava |
|---|---|
| Selo "Catálogo sempre atualizado" | faixa de números da capa da home |
| Subtítulo "A mesma sequência do catálogo impresso da loja." | seção "Todas as peças" da home |
| Rótulo "Navegue" | acima de "Categorias", na home e na página `/categoria` |
| Contagem total do catálogo ("69 peças") | faixa da capa da home, etiqueta do cabeçalho de `/produtos` e o rótulo do botão "Ver as 69 peças do catálogo" |

Consequências de layout, para não sobrar buraco:

- A faixa de números da capa continha os três primeiros itens da lista acima, então **ela deixou
  de existir por inteiro**. A capa fechou no par de botões, com o respiro entre parágrafo e
  botões subindo de `mt-8` para `mt-9` — sem isso o espaço lido como "meio da composição"
  passaria a ser o fim dela.
- O botão do fim da prévia virou **"Ver todas as peças"**: sem o número, ele repetiria palavra
  por palavra a chamada principal da capa.
- Em `/produtos`, a descrição também perdeu o trecho "na mesma sequência do catálogo impresso" e
  voltou a ser "Todas as peças Fruto da Malha para o seu negócio." A `<PageHeader contagem>`
  continua existindo como recurso — só não é mais usada ali.

**Duas leituras que fiz e vale conferir**, porque o pedido falava em "quantidade total de
produtos do catálogo":

1. **Mantive a contagem por categoria** (`/categoria/[slug]` → "9 peças") **e a de resultados da
   busca** ("9 peças encontradas"). Nenhuma das duas diz quantas peças o catálogo tem; a segunda
   é o retorno de que a busca funcionou. Se a intenção era esconder qualquer número, é só pedir.
2. **Mantive "75 peças cadastradas" no painel**, que é ferramenta da administradora — lá o total
   (incluindo as ocultas) é justamente o dado de trabalho.

A palavra "navegue" continua aparecendo em duas frases ("Navegue pelo catálogo e defina
tamanhos…"), onde ela é verbo dentro de uma explicação, não o rótulo que foi removido.

### Nova funcionalidade — observação individual por peça

A cliente pode escrever um recado **para cada peça** da seleção ("quero uma azul e uma branca",
"separar o 40"). O recado acompanha a peça na mensagem do WhatsApp.

**Onde a informação mora, e por quê.** O carrinho guarda **um item por produto**, com todos os
tamanhos dentro dele (`CartItem.tamanhos`, ver `types/cart.ts`). Logo, uma observação por item
já é uma observação por produto, e não existe caminho em que o recado de uma peça encoste no de
outra — tudo é endereçado pelo `produtoId`. Por isso o campo novo é `CartItem.observacao`, e
**não** um campo de observação do carrinho inteiro.

O campo é **opcional de propósito**: carrinhos salvos no `localStorage` antes desta sessão não
têm a chave e precisam continuar abrindo sem erro. Ausente e vazio significam a mesma coisa.
Não foi preciso versionar nem migrar o storage.

**Uma ação só no store.** `definirObservacao(produtoId, texto)`: texto em branco **apaga** a
chave. Assim "adicionar", "editar" e "remover" da interface são a mesma operação — não três
caminhos com três oportunidades de divergir.

**Limite de 280 caracteres** (`LIMITE_OBSERVACAO`), aplicado no `maxLength` do campo e de novo no
store. O motivo não é estético: o pedido sai como link `wa.me?text=…` e a mensagem inteira viaja
na URL; sem teto por item, dez recados longos poderiam estourar o tamanho que o WhatsApp aceita
e o link simplesmente não abriria.

**A interface tem três estados no mesmo lugar** (`components/cart/ItemObservacao.tsx`), sem modal
e sem campo aberto por padrão:

1. **sem observação** → botão discreto "Adicionar observação";
2. **escrevendo** → o campo abre no lugar do botão, já com o foco e o cursor no fim do texto,
   mostrando quantos caracteres ainda cabem; `Esc` desiste, `Ctrl`/`⌘`+`Enter` salva, `Enter`
   sozinho continua quebrando linha;
3. **com observação** → bloco coral com o texto e as ações "Editar" e "Remover".

O campo fechado por padrão foi a decisão central: com dez peças na seleção, dez caixas de texto
vazias empilhadas transformariam a tela de pedido num formulário. Quem não tem recado não vê
campo. Tudo usa os tokens que já existem (pílula, `coral-50`, `ring-coral-100`, 44px de alvo de
toque) — nenhum componente novo de aparência estranha ao resto.

**Na mensagem do WhatsApp**, a observação entra como **última linha do bloco da própria peça**,
com o prefixo 📝 — nunca como um recado geral no rodapé, que obrigaria a vendedora a cruzar de
cabeça qual referência tem qual pedido:

```
📦 Ref. 01001 — Macacão curto c/alça botão Silk screen
Único: 2 un.
Valor unitário: R$ 12,95
Subtotal: R$ 25,90
📝 Observação: Quero uma azul e uma branca.
```

**Nada mudou no backend** — nenhum endpoint, coluna, DTO ou migration. Registrado também em
`docs/ARCHITECTURE.md` §5, junto da decisão de não persistir pedido: a observação é texto da
cliente que morre na mensagem do WhatsApp, e deve continuar assim.

### Arquivos desta sessão

| Arquivo | O que mudou |
|---|---|
| `src/types/cart.ts` | campo `observacao?: string` no `CartItem`, com o racional |
| `src/store/cart-store.ts` | ação `definirObservacao` + constante `LIMITE_OBSERVACAO` |
| `src/components/cart/ItemObservacao.tsx` | **novo** — os três estados da observação |
| `src/components/cart/CartItemRow.tsx` | encaixe do bloco entre quantidade e subtotal |
| `src/lib/whatsapp.ts` | observação dentro do bloco de cada peça |
| `src/app/(public)/page.tsx` | remoção da faixa de números, do selo, do rótulo "Navegue" e do subtítulo; rótulo do botão |
| `src/app/(public)/categoria/page.tsx` | remoção do rótulo "Navegue" |
| `src/app/(public)/produtos/page.tsx` | remoção da contagem e do trecho da descrição |
| `docs/ARCHITECTURE.md` | §5: a observação também não é persistida no backend |

### Verificação feita

Ambiente real (Postgres + backend perfil `dev` + `npm run dev`) e navegador de verdade (Edge
dirigido por Playwright), com **20 asserções automatizadas** cobrindo os sete testes pedidos:

| Teste | Resultado |
|---|---|
| 1. categoria → peça → carrinho → adicionar observação → salvar | ✅ (inclusive o campo abrindo já com foco) |
| 2. duas peças, observações diferentes | ✅ A fica com A, B fica com B (conferido no `localStorage`) |
| 3. editar uma | ✅ só a editada muda — e "Cancelar" descarta de verdade |
| 4. remover uma | ✅ some só aquela; a peça continua no carrinho |
| 5. alterar quantidade | ✅ observação permanece; sobrevive a sair, voltar e recarregar |
| 6. remover a peça | ✅ a observação vai junto, e some da mensagem |
| 7. mensagem do WhatsApp | ✅ recado dentro do bloco da peça certa; peça sem recado não ganha linha vazia |

Também: `npm run type-check` → 0 erros · `npm run lint` → 0 erros e 0 avisos · `npm run build` →
sucesso, 18 rotas · varredura de console nas 8 rotas → **0 erro e 0 aviso** · telas conferidas em
1440px e 390px (no celular os botões "Salvar"/"Cancelar" começaram com 36px e foram corrigidos
para os 44px que o resto do projeto usa).

**Não verificado**: envio real pelo WhatsApp (o link é montado corretamente, mas quem o abriu foi
um navegador de teste) e o comportamento com fotos reais, que continuam pendentes de Cloudinary.

---

## Changelog da sessão 6 (2026-09-01) — redesign visual: de protótipo a produto

> **Duas rodadas de trabalho entre a sessão 5 e esta não estão descritas neste arquivo** —
> existem só no histórico do git: `f66f2da` *"Corrigir responsive e overflow no mobile"*
> (2026-08-13) e `70f1928` *"Importar catálogo: 75 produtos, 14 categorias, 13 tamanhos, preço
> 0,00 e oculto"*. Quem quiser o detalhe delas precisa ler o diff.

Objetivo desta sessão: tirar do site a aparência de protótipo acadêmico, **sem trocar a
identidade da marca, a arquitetura ou qualquer funcionalidade**. A sessão 4 já tinha dado ao
projeto a cara da Fruto da Malha (creme, coral, rabiscos, logo real); o que faltava era ofício de
interface — enquadramento, hierarquia, ritmo e consistência entre telas.

Esta foi também **a primeira sessão em que o sistema inteiro rodou de verdade num navegador**,
com Postgres, backend e os 75 produtos reais carregados (ver "Verificação", abaixo). Até aqui o
projeto só tinha sido compilado, buildado e exercitado por `curl`.

### O diagnóstico (o que fazia o site parecer protótipo)

1. **A manuscrita carregava 100% do texto** — inclusive formulários, listas, preços e o painel
   inteiro. Fonte de personalidade usada como fonte de leitura é o sinal mais forte de
   "protótipo bonitinho".
2. **Sem enquadramento**: o `container` do Tailwind cresce até 1536px. Numa tela ampla a grade
   esticava de ponta a ponta e a página perdia o eixo de leitura.
3. **Sem hierarquia repetida**: cada página inventava o próprio cabeçalho — a mesma informação
   (título, contagem, descrição) em três tamanhos e três espaçamentos diferentes.
4. **Fundo competindo com o conteúdo**: os rabiscos a `opacity: 0.55` atrás de tudo.
5. **Ruído no card da peça**: um "Ver peça" com cara de botão em cada card (o card inteiro já é
   um link) e uma pílula coral de categoria sobre cada foto.
6. **Painel de trabalho pouco cuidado**: menu que rolava para fora da tela, 12 campos empilhados
   sem divisão no formulário de peça, listas esticadas até a borda do monitor.

### Etapa 1 — base visual

- **Duas fontes, dois papéis** (a mudança de maior impacto): **Nunito** (`font-sans`, padrão do
  `body`) carrega leitura, formulários, listas, preços e o painel; **Shantell Sans**
  (`font-marca`) fica com logotipo, títulos e chamadas. A manuscrita continua em toda tela — só
  parou de ser obrigada a fazer o que ela não faz bem. Ver `docs/DESIGN_SYSTEM.md` §3.2.
- **Enquadramento**: `container` limitado a **1200px** (`container.screens` no
  `tailwind.config.ts`) e `.container-largo` de **1120px** para o painel.
- **Ritmo vertical único**: `.secao` (py-12/16) e `.secao-compacta` (py-8/10) no lugar de um
  espaçamento diferente por página.
- **Escala tipográfica com papel definido**: `.olho` (rótulo curto), `.titulo-vitrine`,
  `.titulo-secao`, `.titulo-pagina`, `.titulo-bloco`, `.texto-apoio`, `.ficha-peca`.
- **Sombras em duas camadas** (contato + difusa) e uma curva de transição única (`ease-marca`).
- **Fundo dos rabiscos de `0.55` para `0.28`**, com a classe `.painel-rabiscos` devolvendo o
  padrão em força total onde ele é assinatura (capa da home, rodapé, tela de login).

### Etapa 2 — componentes globais

Novos: **`PageHeader`** (cabeçalho único das listagens), **`Breadcrumbs`**, **`NavLink`** (marca
a seção atual no menu — antes todos os links eram idênticos em qualquer página),
**`FormSection`**, **`ProductGridSkeleton`** e quatro **`loading.tsx`** (catálogo, categoria,
busca e peça): as rotas públicas são renderizadas no servidor a cada acesso, e sem eles a espera
acontecia com a tela anterior congelada.

Revisados: `Button` (tamanho `lg`; estado desabilitado próprio, em vez de um coral a 50% que
parecia clicável), campos (`Input`/`Select`/`Textarea` com um só corpo; o `<select>` ganhou seta
desenhada na cor da marca), `Badge` (ponto de estado), `EmptyState`, `Skeleton` (varredura de
luz), `Modal`, `QuantityStepper`, `Switch`, `Pagination`/`PaginationLinks`, `TopBar` (deixou de
ser uma faixa coral de ponta a ponta — ela competia com os botões de ação), `Header`, `Footer`,
`Logo`, `SearchBar` (com botão de limpar), `CartButton`, `WhatsAppFloatingButton`. `.btn-icone`
passou a ser a classe única dos ícones-botão de 44px, que estavam copiados em nove arquivos.

### Etapa 3 — páginas

- **Home**: capa em painel arredondado com o padrão do catálogo, números **reais** do acervo
  (nada de promessa de marketing), CTA duplo (catálogo + WhatsApp) e uma seção nova **"Como
  funciona"** em três passos — o site não é loja virtual, e quem chega esperando carrinho e
  pagamento precisa entender o caminho antes de escolher, não depois.
- **Catálogo / categoria / busca**: mesmo cabeçalho, mesma grade (2→3→4 colunas), mesma
  paginação, estados vazios de verdade.
- **Peça**: duas colunas equilibradas (a galeria tem teto de 26rem — sem ele a foto ficava com
  800px de altura e a ficha sobrava no vazio), ficha técnica em bloco, e o seletor de tamanhos
  virou um painel com cabeçalho, linhas que acendem quando escolhidas e rodapé de total.
- **Seleção**: cabeçalho com contagem, linhas com subtotal destacado, resumo grudado no topo e
  uma frase explicando o que acontece ao tocar em "Enviar pelo WhatsApp".
- **Painel**: menu de altura inteira (`sticky`) com o usuário identificado, filtros num painel
  separado da lista (com "limpar filtros"), linhas legíveis, **formulário de peça dividido em
  quatro blocos** (Identificação · Preço e organização · Tamanhos · Publicação) e barra de ação
  grudada no rodapé da janela, login recomposto.

### Etapa 4 — responsividade

Revisado em 1440px, 768px e 390px com navegador real. Duas correções vieram daí: a virada do
cabeçalho para uma linha passou de `md` para `lg` (no tablet a busca ficava espremida a ponto de
cortar o próprio texto de exemplo) e o logotipo ganhou largura responsiva — em 390px o nome da
marca quebrava em duas linhas e dobrava a altura do cabeçalho.

### Três defeitos reais encontrados por rodar o sistema (nenhum aparece em build/lint/type-check)

1. **`Hydration failed` na tela de seleção — bug pré-existente, provavelmente desde a sessão 2.**
   `useCartHasHydrated` lia `persist.hasHydrated()` no inicializador do `useState`. Como o
   `localStorage` é síncrono, o zustand já havia reidratado nesse instante: o cliente renderizava
   `true` contra o `false` do HTML do servidor, e o React derrubava e refazia a árvore inteira da
   página. Corrigido com **`useSyncExternalStore`**, que é a API feita exatamente para isso
   (snapshot do servidor durante a hidratação, snapshot do cliente depois).
2. **`totalProdutos` das categorias conta também as peças ocultas** (75 cadastradas contra 69
   publicadas). Por isso a contagem por categoria **não é exibida no site público** — apareceria
   errada para a cliente, sem nenhum sinal de que está errada. No painel ela continua, onde
   incluir o oculto é o comportamento correto, agora com o rótulo "(inclui as ocultas)".
3. **`truncate` num contêiner flex não corta nada** — introduzido e corrigido nesta sessão: o
   nome da peça no painel era cortado na borda do card, sem reticências, no celular.

Também silenciado o aviso do Next sobre `scroll-behavior: smooth` (`data-scroll-behavior` no
`<html>`).

### Acessibilidade: regra de contraste explicitada (e aplicada)

A sessão 4 resolveu o coral em texto; faltava fechar os degraus intermediários.

| Uso | Antes | Agora | Contraste sobre o creme |
|---|---|---|---|
| Rótulo pequeno em coral (`.olho`, categoria do card) | `coral-700` | **`coral-800`** | 6,34:1 ✅ |
| Título grande em coral | `coral-700` | `coral-700` (mantido) | 4,47:1 ✅ (≥24px) |
| Texto auxiliar (dicas, contagens, migalhas) | `ink-400`/`ink-300` | **`ink-500`** | 4,54:1 ✅ |

`ink-400` e `ink-300` continuam existindo, mas **só para ícone, placeholder e estado
desabilitado** — nunca para texto que carrega informação exclusiva.

### Verificação feita nesta sessão

Ambiente real, pela primeira vez: `docker compose up -d` (Postgres) + `./mvnw spring-boot:run`
(perfil `dev`, com as 69 peças ativas e 6 ocultas já no banco) + `npm run dev`.

- **Navegador real** (Edge dirigido por Playwright): as 8 rotas públicas e do painel
  respondendo 200 e renderizando, com **zero erro e zero aviso no console** — incluindo um
  recarregamento da `/selecao` com itens, que é onde o erro de hidratação aparecia.
- **Fluxo completo**: peça → escolher tamanhos → "Adicionar à seleção" → `/selecao` com contagem
  e totais corretos (5 peças, R$ 63,10) → link do WhatsApp montado.
- **Painel**: login real, listagem paginada das 75 peças, filtros e a tela de edição carregando
  uma peça existente.
- **Três larguras**: 1440px, 768px e 390px.
- `npm run type-check` → 0 erros · `npm run lint` → 0 erros e 0 avisos · `npm run build` →
  sucesso, 18 rotas.

### O que esta sessão **não** verificou

- **Fotos reais.** O Cloudinary continua com credenciais de exemplo em `backend/.env`, então
  todas as peças aparecem com o estado "Foto em breve" — que por isso mesmo foi **desenhado**
  nesta sessão, no card, na galeria e na seleção. Como o catálogo fica com foto de verdade,
  ninguém viu ainda.
- Upload de mídia, arrastar-e-soltar da galeria e reordenação (dependem do Cloudinary).
- Dispositivo real: swipe da galeria no celular e vídeo *inline* no iPhone seguem por testar.
- **O backend não foi tocado** nesta sessão (nenhum arquivo em `backend/` no diff) e continua
  sem nenhum teste automatizado.

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

### 🐛 Bug grave encontrado e corrigido: toda edição de produto falhava com 500

Descoberto ao rodar o frontend de produção contra o backend em contêiner — **não** aparece em
build, lint ou type-check, só exercitando a API.

`Produto.definirTamanhos()` fazia `clear()` na coleção e recriava todos os `ProdutoTamanho`. Com
`orphanRemoval = true`, o Hibernate enfileira o INSERT das linhas novas **antes** do DELETE das
órfãs, e um tamanho que permaneceu selecionado colidia consigo mesmo na constraint única
`uk_produto_tamanho`:

```
ERROR: duplicate key value violates unique constraint "uk_produto_tamanho"
```

**Impacto:** qualquer edição de produto que mantivesse ao menos um tamanho retornava 500 — ou
seja, praticamente toda edição. Trocar um preço, a operação mais comum da administradora, era
impossível.

**Correção:** `definirTamanhos()` passou a fazer a diferença entre o conjunto atual e o desejado,
removendo só o que saiu e inserindo só o que entrou. Linhas que não mudaram nunca são tocadas —
não há INSERT para colidir.

**Por que passou despercebido até agora:** um teste anterior desta mesma sessão reportou `200`
neste fluxo, mas a lista de tamanhos tinha saído vazia por um erro na extração do ID no script —
sem nenhum INSERT, não havia colisão. O falso positivo foi identificado ao repetir o teste de
forma determinística, com 7 combinações de tamanhos.

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
(paginação real, galeria com swipe, SEO, vocabulário de seleção — ver changelog); redesenhado na
sessão 6; observação por peça na seleção adicionada na sessão 7.

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

### 2. Verificação manual real (avançou muito na sessão 6)

**Já verificado por `curl`** (sessão 5, contra o contêiner de produção): login, autorização das
rotas, CORS, criação de categoria e produto, alteração de preço, ocultar produto, e a propagação
imediata para o catálogo público.

**Já verificado em navegador** (sessão 6, ambiente de desenvolvimento com o banco real e as 75
peças importadas; Edge dirigido por Playwright): as 8 rotas públicas e do painel renderizando
sem erro nem aviso de console, o fluxo peça → tamanhos → "Adicionar à seleção" → `/selecao` com
totais corretos, o link do WhatsApp sendo montado, o login do painel, a listagem paginada com
filtros e a tela de edição de uma peça — em 1440px, 768px e 390px.

**Continua faltando**, porque exige Cloudinary configurado e/ou dispositivo real:
- [ ] Upload de foto/vídeo real no Cloudinary (precisa das credenciais em `backend/.env` —
      hoje são `xxx`), reordenação da galeria por drag-and-drop e marcação de capa.
- [ ] **Ver o catálogo com fotos de verdade.** Todas as peças estão no estado "Foto em breve";
      o desenho das telas com foto nunca foi visto com imagem real.
- [ ] Abrir o link do WhatsApp num celular e conferir a mensagem no aplicativo (o link é
      montado corretamente, mas quem abriu foi um navegador de teste).
- [ ] **Precisa de dispositivo real:** swipe da galeria num celular (inclusive confirmando que
      o scroll vertical da página não troca a foto), vídeo tocando *inline* num iPhone, e o
      preview do link do produto colado numa conversa do WhatsApp aparecendo com a foto
      (depende de `NEXT_PUBLIC_SITE_URL` correto e do site publicado).

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
- [x] ~~Acabamento de interface (enquadramento, hierarquia, tipografia de leitura, consistência
      entre telas, painel)~~ — **resolvido na sessão 6**. Ver o changelog no topo e
      `docs/DESIGN_SYSTEM.md` §3.2, §3.5 e §7.
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

1. **Credenciais reais do Cloudinary e as fotos no ar.** Passou a ser o item mais urgente: as 111
   fotos estão em `referencias/fotos-catalogo/`, o script `scripts/catalogo/enviar_fotos.py` está
   pronto, e hoje **todas as peças do catálogo aparecem com "Foto em breve"**. Um catálogo de
   roupas sem foto é o maior buraco que sobrou — bem maior que qualquer ajuste visual.
2. **Publicar** seguindo [`docs/DEPLOY.md`](DEPLOY.md) — Neon, depois Railway, depois Vercel. O
   código já está preparado e verificado em contêiner; o que resta são contas e cliques.
3. **Rever as telas com foto de verdade.** O redesign da sessão 6 foi validado num navegador,
   mas com o placeholder em 100% das peças. Card, galeria e seleção usam `object-contain` e
   foram desenhados para foto recortada (ver `DESIGN_SYSTEM.md` §3.4); espere pequenos ajustes
   quando as imagens reais entrarem.
4. **Os 6 preços pendentes** das peças que continuam ocultas (o dígito "1" que o OCR comeu — a
   lista está no changelog da sessão que importou o catálogo e no `conferir_catalogo.py`).
5. Testes automatizados (item 1 acima) — pelo menos um smoke test de contexto do Spring Boot
   (`@SpringBootTest` com Testcontainers) e os testes unitários de `lib/cart.ts`/`whatsapp.ts` no
   frontend, que são baratos e de alto valor por serem lógica de negócio pura.
6. Verificação em dispositivo real (item 2 acima): swipe da galeria, vídeo *inline* no iPhone e o
   preview do link no WhatsApp.
