import type { Config } from 'tailwindcss';

/**
 * Identidade visual extraída do catálogo oficial da Fruto da Malha
 * (`referencias/TABELA 0 2025 .pdf`, 96 páginas feitas no Canva).
 * Ver `docs/DESIGN_SYSTEM.md` para a análise completa e o racional de cada decisão.
 *
 * Cores lidas diretamente do PDF: fundo creme #FFFBEF, marrom da assinatura #755A49,
 * verde das descrições #297F02.
 *
 * O laranja da marca foi reancorado em **#FEA758** (a referência entregue pela loja). Toda a
 * escala `coral` foi redesenhada travada na matiz dele (~28.5°), com croma alto: os degraus
 * escuros deixaram de puxar para o marrom avermelhado e agora são o mesmo laranja, só mais
 * denso.
 *
 * ⚠️ #FEA758 tem 1.9:1 contra o branco e 6.7:1 contra `ink-900`. Por decisão estética da loja,
 * **todo preenchimento laranja carrega texto branco** — o contraste fica abaixo do mínimo da
 * WCAG e isso é sabido e aceito. `ink-900` é a saída se a decisão mudar: mesma cor de fundo,
 * só a cor da fonte.
 *
 * Os degraus escuros (`600`–`900`) são **cor de texto sobre o creme**, não fundos: é onde o
 * laranja precisa ficar denso para ser legível. `600` para título grande, `800` para rótulo
 * pequeno. Texto corrido continua no `ink`.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /** Fundo da marca — o creme de todas as 96 páginas do catálogo. */
        creme: {
          DEFAULT: '#FFFBEF',
          50: '#FFFDF8',
          100: '#FFFBEF',
          200: '#FDF4E0',
          300: '#F7E9CD',
        },
        /**
         * Laranja da marca. Escala inteira na matiz de `400`, o tom de referência da loja.
         *
         * Papéis fixos (não improvisar fora deles):
         * - `400` **#FEA758** — a identidade, e o **único laranja que preenche**: botão
         *   principal, círculos de categoria, indicadores, sublinhado do menu ativo, switch
         *   ligado, contador da sacola. Rótulo sempre em branco (ver o aviso no topo).
         * - `600` **#E06C09** — título grande em laranja sobre o creme (3.21:1, e título tem
         *   28px+, onde o mínimo é 3:1).
         * - `800` **#96480A** — rótulo pequeno em laranja (6.29:1) e botão destrutivo.
         * - `50`–`300` — véus, anéis, bordas e hover dos preenchimentos.
         */
        coral: {
          50: '#FFF6EC',
          100: '#FFE9D3',
          200: '#FFD4AC',
          300: '#FFBE84',
          400: '#FEA758',
          500: '#F98C2E',
          600: '#E06C09',
          700: '#BC5A00',
          800: '#96480A',
          900: '#77390A',
        },
        /** Tinta: marrom quente da assinatura do catálogo. Toda leitura acontece aqui. */
        ink: {
          300: '#BFAEA2',
          400: '#9C8577',
          500: '#8A6E5D',
          600: '#755A49',
          700: '#5A463A',
          800: '#4A392F',
          900: '#3D2E24',
        },
        /** Verde das descrições de produto do catálogo. */
        verde: {
          50: '#EDF7E6',
          100: '#D6EDC7',
          500: '#3A9906',
          600: '#297F02',
          700: '#1F6202',
        },
      },
      fontFamily: {
        // Duas fontes com papéis separados (ver docs/DESIGN_SYSTEM.md §3.2):
        //
        // `sans` (padrão de todo o site) é a Nunito — humanista, de terminações arredondadas,
        // desenhada para texto de interface. É ela que carrega leitura corrida, formulários,
        // tabelas, preços e o painel inteiro.
        //
        // `marca` é a Shantell Sans, a manuscrita que representa o catálogo impresso. Fica
        // reservada para títulos, logotipo e chamadas — onde ela é personalidade, e não
        // obstáculo de leitura.
        sans: ['var(--font-ui)', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        marca: ['var(--font-marca)', 'ui-rounded', 'Comic Sans MS', 'cursive'],
      },
      backgroundImage: {
        // Ladrilho de rabiscos infantis recortado do próprio catálogo e espelhado nos dois
        // eixos para repetir sem costura visível.
        rabiscos: "url('/marca/rabiscos.webp')",
      },
      borderRadius: {
        // Vocabulário único de raio: 'peca' para mídia e cards, 'pilula' para controles.
        peca: '1.5rem',
        pilula: '999px',
      },
      boxShadow: {
        // Sombras muito suaves e quentes — o catálogo não tem sombra dura em lugar nenhum.
        // Duas camadas (contato + difusa) em vez de uma só: é o que dá sensação de peso real
        // sem escurecer o creme.
        suave: '0 1px 2px rgba(117, 90, 73, 0.05), 0 2px 8px -4px rgba(117, 90, 73, 0.10)',
        peca: '0 1px 2px rgba(117, 90, 73, 0.05), 0 8px 24px -12px rgba(117, 90, 73, 0.20)',
        flutuante: '0 2px 4px rgba(117, 90, 73, 0.06), 0 16px 40px -12px rgba(117, 90, 73, 0.28)',
        alta: '0 24px 64px -16px rgba(117, 90, 73, 0.35)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1.25rem',
          sm: '1.5rem',
          lg: '2rem',
        },
        // Sem isto o container do Tailwind cresce até 1536px: numa tela ampla a grade de peças
        // esticava e a página perdia o eixo de leitura. 1200px mantém 4 colunas confortáveis e
        // margens visíveis nas laterais — enquadramento, não preenchimento.
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1200px',
          '2xl': '1200px',
        },
      },
      keyframes: {
        surgir: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        brilho: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        surgir: 'surgir 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        brilho: 'brilho 1.6s infinite',
      },
      transitionTimingFunction: {
        // Curva de saída suave, usada nos hovers e nas entradas — evita o "elástico" barato.
        marca: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
