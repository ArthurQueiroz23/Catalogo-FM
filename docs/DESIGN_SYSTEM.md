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

### 3.1 O coral da marca não pode ser cor de texto

**`#FFA85A` sobre `#FFFBEF` dá contraste de 1,85:1.** O mínimo da WCAG é 4,5:1 para texto normal
e 3:1 para texto grande. No catálogo isso passa despercebido porque é impressão a 24pt; na web,
em 15px num celular ao sol, seria ilegível — e reprovaria em acessibilidade de forma grave.

Solução que preserva a marca inteira:

| Papel | Token | Contraste sobre o creme |
|---|---|---|
| Texto corrido | `ink-600` `#755A49` (marrom do próprio PDF) | 6,12:1 ✅ |
| Títulos | `ink-900` `#3D2E24` | 12,57:1 ✅ |
| Títulos de seção (grandes) | `coral-700` `#B95A15` | 4,47:1 ✅ (≥3:1 para texto grande) |
| **Preenchimento** | `coral-400` `#FFA85A` — **o valor exato do PDF** | usado com `ink-900` por cima: 6,81:1 ✅ |

Ou seja: **o coral da marca continua presente e dominante** — só mudou de papel. Ele preenche
botões, chips, indicadores e o item ativo do menu, em vez de escrever.

### 3.2 Tipografia: manuscrita em tudo, mas com uma fonte que aguenta interface

`Ballpoint` e `BryndanWrite` são fontes proprietárias do Canva — não licenciáveis para web.

Decisão do produto: **manter a manuscrita em todo o site**, fiel ao catálogo. Escolhida
**Shantell Sans** (Google Fonts, variável 400–700) por ser a única manuscrita do catálogo do
Google desenhada explicitamente para uso em interface — aguenta texto corrido, formulários e
números sem virar decoração ilegível, o que fontes de script puro não fazem.

Compensações aplicadas por ser manuscrita:
- corpo em `0.9375rem` (15px) em vez de 14px;
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

---

## 4. Tokens (`tailwind.config.ts`)

### Cores

```
creme    DEFAULT #FFFBEF   fundo do site (valor do PDF)
         50      #FFFDF8   superfícies elevadas (cards, campos)
         200/300           divisórias e estados desabilitados

coral    400     #FFA85A   ← COR DA MARCA (valor exato do PDF). Preenchimento.
         100/200           chips suaves, bordas, anéis
         600/700/800       texto de marca, hover, estados fortes

ink      600     #755A49   ← corpo de texto (valor do PDF)
         900     #3D2E24   títulos
         300/400           texto auxiliar, placeholder

verde    600     #297F02   ← sucesso (valor do PDF)
```

### Raio — três degraus, um significado cada

| Token | Valor | Onde |
|---|---|---|
| `rounded-pilula` | 999px | **controles**: botões, chips, campos de busca, ícones-botão |
| `rounded-peca` | 1.5rem | **superfícies grandes**: galeria, cards, painéis, modais |
| `rounded-2xl` | 1rem | **superfícies pequenas**: campos de formulário, miniaturas, linhas de lista |

Antes existiam quatro raios sem regra (`lg`, `xl`, `2xl`, `full`) usados de forma intercambiável.

### Sombra

`shadow-peca` e `shadow-flutuante`, ambas em marrom translúcido (`rgba(117,90,73,…)`) e muito
suaves — o catálogo não tem sombra dura em lugar nenhum.

### Fundo

`body::before` aplica o ladrilho de rabiscos a `opacity: 0.55`, `position: fixed` (o padrão fica
parado enquanto a página rola, como papel) e `background-size` menor no celular.

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
  tinha 32px.
- **Contraste**: todos os pares texto/fundo validados (§3.1). Nenhum texto usa o coral puro.
- **Foco visível único** (`.foco-marca`): contorno coral de 2px com offset, em todo elemento
  interativo. Antes havia dois modelos concorrentes (`focus:ring` nos campos, `focus-visible:
  outline` nos botões).
- **`prefers-reduced-motion`** desliga todas as animações de entrada.
- **Galeria**: `Esc` fecha o zoom, setas navegam, o foco vai para o botão de fechar ao abrir,
  e o scroll do body é travado.
- **`aria-current`** no menu do painel e nas miniaturas da galeria; `aria-live` na quantidade.

---

## 7. Um único sistema de componentes

`.btn-primary` / `.btn-secondary` no `globals.css` e as variantes do `<Button>` são **as mesmas
classes**. Antes eram duas implementações que renderizavam em tamanhos diferentes (`px-5 py-2.5`
contra `px-4 py-2`) para a mesma função — o site público usava uma, o painel usava a outra.

Da mesma forma, `Input`, `Select` e `Textarea` compartilham `classesCampo()`, exportada de
`Input.tsx`. A `SearchBar` era a única que reimplementava o estilo inline.

---

## 8. Critério de sucesso

> Uma pessoa que conhece o catálogo em PDF entra no site e reconhece imediatamente a mesma marca.

O que sustenta esse reconhecimento, em ordem de peso:

1. o **fundo creme rabiscado** (a assinatura mais forte do catálogo);
2. o **logo real**, extraído do próprio PDF;
3. a **tipografia manuscrita** em todo o site;
4. o **coral `#FFA85A`** preenchendo os elementos de ação;
5. as **fotos flutuando sem moldura**, inteiras;
6. a **ordem dos dados da ficha**, idêntica à das páginas do catálogo.
