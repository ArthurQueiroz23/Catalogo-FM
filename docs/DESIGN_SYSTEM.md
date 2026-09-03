# Design System — Fruto da Malha

A identidade visual deste projeto **não foi inventada**: ela foi extraída do catálogo oficial da
loja, `referencias/TABELA 0 2025 .pdf` — 96 páginas feitas no Canva, que é exatamente o material
que este sistema existe para substituir.

Este documento registra o que foi encontrado no PDF, como cada achado virou código, e — mais
importante — **onde a web precisou divergir do impresso e por quê**.

---

## 1. O que o catálogo é

| | |
|---|---|
| Arquivo | `referencias/TABELA 0 2025 .pdf` (119 MB, 96 páginas) |
| Origem | Canva (`creator: Canva`, `author: frutodamalhabebe2`) |
| Formato | 454 × 284 pt — paisagem ~16:10, formato de apresentação (não A4) |
| Estrutura | capa → contato → blocos por categoria, cada um aberto por uma página-divisor |

### Padrões que se repetem nas 96 páginas

1. **Página de peça**: foto recortada (PNG sem fundo, sem sombra) à esquerda + bloco de texto
   manuscrito à direita, ambos flutuando sobre o creme rabiscado. **Sem card, sem borda,
   sem contenção.**
2. **Ordem fixa dos dados**: `Referência 01123.` → descrição → `Tecido Suedine.` →
   `Tamanho P/M/G.` → `Unissex`.
3. **Divisor de categoria**: página inteira só com o nome em coral gigante ("Macacão curto",
   "Bodys", "Pijamas", "Mijões", "Camisetas", "Shorts", "Roupões", "Babadores", "Toalhas",
   "Kits de toalha", "Prematuros").
4. **Callout de detalhe**: recorte circular + seta curva desenhada à mão + legenda ("Zíper",
   "Detalhe: aplique", "Pé reversível").
5. **Bolinhas de cor** enfileiradas ao lado da peça, indicando as cores disponíveis.
6. **Marca d'água** do logo em pêssego translúcido, canto inferior direito de toda página.
7. **Fundo creme com rabiscos infantis** a lápis de cor pastel: sol, nuvem, casinha, "123",
   abelha, carrinho, foguete, arco-íris, estrela, patinho, sorvete, bicicleta, jogo da velha.

---

## 2. Valores extraídos (medidos, não estimados)

Fontes e cores lidas diretamente das entranhas do PDF (PyMuPDF), não a olho sobre um render.

### Tipografia do impresso

| Fonte | Volume | Uso | Tamanhos |
|---|---|---|---|
| `Ballpoint-Regular` | 8.020 chars | descrições e títulos de seção | 24pt corpo, 63–78pt títulos |
| `BryndanWrite` | 201 chars | "Vestindo carinho", "Atacado de confiança" | 17–23pt |
| `Montserrat-Regular` | 166 chars | **só** os contatos da p.2 | 8,5pt |

### Cores do impresso

| Hex | Volume | Papel no catálogo |
|---|---|---|
| `#FFA85A` | 7.739 chars | coral da marca — **97% de todo o texto** |
| `#FFC07E` | 160 chars | pêssego claro (gradiente do logo) |
| `#297F02` | 234 chars | verde de algumas descrições |
| `#755A49` | 32 chars | marrom da assinatura "Vestindo carinho" |
| `#FFFBEF` | fundo | creme de todas as páginas |

---

## 3. Onde a web diverge do impresso — e por quê

> Regra que guiou estas decisões: *extrair a identidade do PDF, não copiar as limitações do PDF.*

### 3.1 O laranja da marca não pode ser cor de texto

> **Sessão 7 — o laranja foi reancorado em `#FEA758`**, a referência entregue pela loja. A escala
> inteira foi redesenhada travada na matiz dele (~28,5°) e com croma alto: os degraus escuros
> puxavam para o marrom avermelhado (`#B95A15`, `#944818`) e agora são o mesmo laranja, só mais
> denso. Os papéis abaixo não mudaram — só os valores.

**`#FEA758` sobre `#FFFBEF` dá contraste de 1,9:1.** O mínimo da WCAG é 4,5:1 para texto normal
e 3:1 para texto grande. No catálogo isso passa despercebido porque é impressão a 24pt; na web,
em 15px num celular ao sol, seria ilegível — e reprovaria em acessibilidade de forma grave.

Solução que preserva a marca inteira:

| Papel | Token | Contraste sobre o creme |
|---|---|---|
| Texto corrido | `ink-600` `#755A49` (marrom do próprio PDF) | 6,12:1 ✅ |
| Títulos | `ink-900` `#3D2E24` | 12,57:1 ✅ |
| Títulos de seção (grandes) | `coral-600` `#E06C09` | 3,21:1 ✅ (≥3:1 para texto grande) |
| **Preenchimento** | `coral-400` `#FEA758` — **o tom de referência da loja** | com `ink-900` por cima: 6,74:1 ✅ |

Ou seja: **o laranja da marca continua presente e dominante** — só mudou de papel. Ele preenche
botões, círculos de categoria, chips, indicadores e o item ativo do menu, em vez de escrever.

**Por que o texto sobre laranja é escuro, e não branco.** Branco sobre `#FEA758` dá **1,9:1** —
reprova em qualquer tamanho de texto, sem exceção de "texto grande". A única forma de fazer o
branco passar seria escurecer o preenchimento até algo como `#BC5A00`, e aí o botão deixa de
mostrar a cor da marca — que é exatamente o que ele existe para fazer. Foi testado na sessão 7 e
revertido: o laranja escuro lia como queimado ao lado do resto da paleta. Fica `#FEA758` cheio
com `ink-900` por cima, 6,74:1.

### 3.2 Tipografia: manuscrita como voz da marca, não como fonte de leitura

`Ballpoint` e `BryndanWrite` são fontes proprietárias do Canva — não licenciáveis para web.

**Decisão da sessão 4:** manter a manuscrita em todo o site, fiel ao catálogo, com
**Shantell Sans** (Google Fonts, variável 400–700) — a única manuscrita do catálogo do Google
desenhada explicitamente para interface.

**Correção da sessão 6:** a manuscrita continua em todo o site, mas **dividiu o trabalho**. Usar
uma única fonte manuscrita para 100% do texto era o traço que mais fazia o projeto parecer
protótipo: em bloco corrido, em campo de formulário, em lista de 20 linhas e em preço, ela cansa
a leitura e some em 15px num celular ao sol. E, principalmente, **soa amador** — porque nenhum
produto real faz isso.

| Papel | Fonte | Onde |
|---|---|---|
| **Voz da marca** (`font-marca`) | Shantell Sans | logotipo, `.titulo-vitrine`, `.titulo-secao`, `.titulo-pagina` |
| **Interface** (`font-sans`, padrão do `body`) | **Nunito** | texto corrido, formulários, listas, botões, preços, painel inteiro |

Nunito foi escolhida por três motivos: terminações arredondadas que conversam com o traço da
marca sem imitá-lo; desenho humanista feito para interface (números e maiúsculas legíveis em
tamanho pequeno); e uma família larga o bastante (400–800) para sustentar toda a hierarquia sem
precisar de uma terceira fonte.

O resultado é que **a manuscrita aparece mais, não menos**: sozinha nos títulos, ela é
reconhecida como assinatura; espalhada por tudo, virava textura.

Compensações mantidas da sessão 4:
- corpo em `0.9375rem` (15px);
- `leading-relaxed` nos blocos de texto;
- `tabular-nums` em quantidades e valores.

### 3.3 Formato: o PDF é paisagem 16:10, a web é responsiva

Nenhuma página foi transformada em HTML de tamanho fixo. O que migrou foi a **linguagem**:
creme + rabiscos, foto flutuando sem moldura, ordem dos dados da ficha, títulos manuscritos
em coral. A grade é fluida, mobile-first.

### 3.4 Foto: `object-contain`, não `object-cover`

No catálogo as peças aparecem **inteiras**, recortadas do fundo. `object-cover` cortaria a roupa.
Todas as fotos de peça usam `object-contain` com respiro interno, sobre um véu creme quase
invisível — que é rede de segurança para fotos que ainda tenham fundo próprio.

### 3.5 Enquadramento: o conteúdo tem largura máxima (sessão 6)

O `container` do Tailwind, sem configuração, cresce até **1536px**. Numa tela ampla o catálogo
esticava de ponta a ponta: cinco colunas de peça, linhas de texto longas demais para ler de uma
vez, e nenhuma margem que dissesse onde a página começa e termina.

| Régua | Largura | Onde |
|---|---|---|
| `container` | **1200px** | todo o site público |
| `.container-largo` | **1120px** | painel administrativo (a lista de peças pede mais largura útil) |
| coluna de formulário | `max-w-3xl` centralizado | cadastro/edição de peça |
| galeria da peça | `max-w-[26rem]` | sem teto, a foto ficava com 800px de altura |

O ritmo vertical também virou régua: **`.secao`** (`py-12 sm:py-16`) e **`.secao-compacta`**
(`py-8 sm:py-10`). Antes cada página escolhia o seu.

### 3.6 O fundo recuou para o fundo (sessão 6)

O ladrilho de rabiscos estava a `opacity: 0.55` atrás de **tudo** — inclusive de grades de 20
peças e de formulários. Ele é a assinatura mais forte do catálogo, mas assinatura não compete
com conteúdo.

- página inteira: **0.28** (reconhecível de longe, invisível de perto);
- **`.painel-rabiscos`**: classe que devolve o padrão a **0.42** onde ele é o assunto — capa da
  home, rodapé e tela de login.

---

## 4. Tokens (`tailwind.config.ts`)

### Cores

```
creme    DEFAULT #FFFBEF   fundo do site (valor do PDF)
         50      #FFFDF8   superfícies elevadas (cards, campos)
         200/300           divisórias e estados desabilitados

coral    400     #FEA758   ← COR DA MARCA (referência da loja). Preenchimento de superfície.
         700     #BC5A00   ← degrau de ação: único preenchimento com texto BRANCO (4,56:1)
         100/200/300       chips suaves, bordas, anéis, círculos de categoria
         600/800/900       título de capa, texto pequeno em laranja, hover

perigo   600     #C0341F   ← só o botão destrutivo do painel (ver §3.1)

ink      600     #755A49   ← corpo de texto (valor do PDF)
         900     #3D2E24   títulos
         500               piso do texto auxiliar (4,54:1 — ver §6)
         300/400           ícone, placeholder e desabilitado — nunca texto

verde    600     #297F02   ← sucesso (valor do PDF)
```

### Tipografia

| Família | Token | Papel |
|---|---|---|
| Nunito | `font-sans` (padrão do `body`) | interface e leitura |
| Shantell Sans | `font-marca` | logotipo, títulos, chamadas |

Classes de texto — **uma por papel**, definidas em `globals.css`:

| Classe | Papel |
|---|---|
| `.olho` | rótulo curto acima de um título (12px, caixa alta, `coral-800`) |
| `.titulo-vitrine` | chamada da capa (`clamp(2.25rem, 7vw, 3.75rem)`, manuscrita) |
| `.titulo-secao` | divisor de seção, no espírito das páginas-divisor do catálogo |
| `.titulo-pagina` | título de página (tinta, não coral) |
| `.titulo-bloco` | título de card, painel ou bloco de formulário |
| `.texto-apoio` / `.ficha-peca` | texto secundário e bloco de dados da peça |

### Raio — três degraus, um significado cada

| Token | Valor | Onde |
|---|---|---|
| `rounded-pilula` | 999px | **controles**: botões, chips, campos de busca, ícones-botão |
| `rounded-peca` | 1.5rem | **superfícies grandes**: galeria, cards, painéis, modais |
| `rounded-2xl` | 1rem | **superfícies pequenas**: campos de formulário, miniaturas, linhas de lista |

Antes existiam quatro raios sem regra (`lg`, `xl`, `2xl`, `full`) usados de forma intercambiável.

### Sombra

Quatro degraus, todos em marrom translúcido (`rgba(117,90,73,…)`) e **em duas camadas** (um
contato curto + uma difusa larga) — uma sombra de camada única parecia adesivo colado na tela,
e o catálogo não tem sombra dura em lugar nenhum.

| Token | Onde |
|---|---|
| `shadow-suave` | repouso de botões, campos e linhas de lista |
| `shadow-peca` | cards e painéis |
| `shadow-flutuante` | hover de card, gaveta do painel, botão do WhatsApp |
| `shadow-alta` | modal |

Movimento: uma curva só, `ease-marca` (`cubic-bezier(0.22, 1, 0.36, 1)`), entre 200 e 300ms.

### Fundo

`body::before` aplica o ladrilho de rabiscos a `opacity: 0.28`, `position: fixed` (o padrão fica
parado enquanto a página rola, como papel) e `background-size` menor no celular.
`.painel-rabiscos` devolve o padrão a `0.42` na capa da home, no rodapé e no login (§3.6).

---

## 5. Assets extraídos do PDF (`frontend/public/marca/`)

| Arquivo | Tamanho | Origem |
|---|---|---|
| `logo.png` / `logo.webp` | 68 KB / 17 KB | maior imagem da capa, com o SMask (alfa) aplicado |
| `icone-512.png` | 138 KB | logo centralizado no quadrado creme — favicon e ícone de app |
| `rabiscos.webp` | **12 KB** | imagem única de fundo da p.6, espelhada nos dois eixos |
| `rabiscos.png` | 66 KB | fallback |

Dois detalhes de extração que valem registro:

1. **O logo vinha com marca d'água "BAZAART"** — a loja usou esse app para remover o fundo. A
   faixa inferior foi descartada antes do recorte.
2. **O alfa do logo estava num SMask separado**, que `extract_image` não aplica: sem
   `pymupdf.Pixmap(pix, mask)` o PNG sai com fundo preto.
3. **O ladrilho é espelhado** (`FLIP_LEFT_RIGHT` / `FLIP_TOP_BOTTOM` / `ROTATE_180`) porque o
   original é uma composição de página inteira — repetido cru, mostraria costura nas bordas.

Os scripts de extração ficaram no scratchpad da sessão, não no repositório: são de uso único e
os assets resultantes estão versionados.

---

## 6. Acessibilidade

- **Alvo de toque de 44px** (`min-h-11`) em todo controle interativo — botões, campos, ícones-
  botão do painel, e principalmente o `QuantityStepper`, que é *a* interação do catálogo e antes
  tinha 32px. (A faixa de contato do topo é a única exceção deliberada: 36px, porque é atalho
  secundário e uma barra de 44px de altura roubava a primeira tela do celular.)
- **Contraste — a regra, e não só os casos** (fechada na sessão 6; todos os valores medidos
  sobre o creme `#FFFBEF`):

  | Cor | Contraste | Pode ser usada em |
  |---|---|---|
  | `ink-900` `#3D2E24` | 12,57:1 | qualquer texto |
  | `ink-600` `#755A49` | 6,12:1 | qualquer texto |
  | `coral-800` `#96480A` | 6,29:1 | qualquer texto — **é o laranja dos rótulos pequenos** |
  | `ink-500` `#8A6E5D` | 4,54:1 | **piso do texto auxiliar** (dicas, contagens, migalhas) |
  | `coral-700` `#BC5A00` | 4,41:1 | **só texto grande** (≥24px, ou ≥18,7px em negrito) — e o preenchimento que aceita branco (4,56:1) |
  | `ink-400` / `ink-300` | 3,36:1 / ~2:1 | **nunca em texto**: ícone, placeholder, desabilitado |
  | `coral-400` `#FEA758` | 1,9:1 | **nunca em texto**: preenchimento, com `ink-900` por cima |

- **Foco visível único** (`.foco-marca`): contorno coral de 2px com offset, em todo elemento
  interativo. Antes havia dois modelos concorrentes (`focus:ring` nos campos, `focus-visible:
  outline` nos botões).
- **Estado desabilitado legível**: o botão primário desabilitado troca de cor (creme + tinta
  apagada) em vez de virar um coral a 50% — que parecia clicável.
- **`prefers-reduced-motion`** desliga todas as animações de entrada (e também o `scroll-behavior:
  smooth`).
- **Galeria**: `Esc` fecha o zoom, setas navegam, o foco vai para o botão de fechar ao abrir,
  e o scroll do body é travado.
- **`aria-current`** no menu do painel, no menu do site (link da seção atual) e nas miniaturas
  da galeria; `aria-live` na quantidade.

---

## 7. Um único sistema de componentes

`.btn-primary` / `.btn-secondary` no `globals.css` e as variantes do `<Button>` são **as mesmas
classes**. Antes eram duas implementações que renderizavam em tamanhos diferentes (`px-5 py-2.5`
contra `px-4 py-2`) para a mesma função — o site público usava uma, o painel usava a outra.

Da mesma forma, `Input`, `Select` e `Textarea` compartilham `classesCampo()`, exportada de
`Input.tsx`. A `SearchBar` era a única que reimplementava o estilo inline.

**Ampliado na sessão 6** — o que era copiado e colado virou componente ou classe:

| Peça | O que resolve |
|---|---|
| `.btn-icone` | os ícones-botão de 44px, que estavam repetidos em nove arquivos |
| `.btn-grande` | o degrau maior das chamadas principais (= `size="lg"` do `<Button>`) |
| `PageHeader` | cabeçalho de listagem: migalhas, rótulo, título, contagem, descrição e ação |
| `Breadcrumbs` | trilha "você está aqui", antes escrita à mão só na página da peça |
| `NavLink` | link de menu que marca a seção atual (`aria-current` + sublinhado coral) |
| `FormSection` | bloco nomeado de formulário do painel |
| `ProductGridSkeleton` + `loading.tsx` | espera visível nas rotas do catálogo |
| `.superficie` / `.superficie-solida` / `.cartao-interativo` | os três tipos de superfície |
| `.chip` | etiqueta de contagem e de resumo |

Regra prática: **se o mesmo bloco de classes aparecer numa terceira tela, ele vira classe ou
componente.**

---

## 8. Critério de sucesso

> Uma pessoa que conhece o catálogo em PDF entra no site e reconhece imediatamente a mesma marca.

O que sustenta esse reconhecimento, em ordem de peso:

1. o **fundo creme rabiscado** (a assinatura mais forte do catálogo);
2. o **logo real**, extraído do próprio PDF;
3. a **tipografia manuscrita nos títulos** — a voz da marca, agora sem carregar o texto corrido;
4. o **laranja `#FEA758`** preenchendo as superfícies, com `#BC5A00` nas ações;
5. as **fotos flutuando sem moldura**, inteiras;
6. a **ordem dos dados da ficha**, idêntica à das páginas do catálogo.

E o critério que a sessão 6 acrescentou:

> Quem **não** conhece o catálogo entra no site e não pensa em "protótipo": entende em três
> segundos o que a loja vende, como pedir, e onde está.
