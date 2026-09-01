import type { Config } from 'tailwindcss';

/**
 * Identidade visual extraída do catálogo oficial da Fruto da Malha
 * (`referencias/TABELA 0 2025 .pdf`, 96 páginas feitas no Canva).
 * Ver `docs/DESIGN_SYSTEM.md` para a análise completa e o racional de cada decisão.
 *
 * Cores lidas diretamente do PDF: fundo creme #FFFBEF, coral da marca #FFA85A,
 * marrom da assinatura #755A49, verde das descrições #297F02.
 *
 * ⚠️ O coral #FFA85A tem contraste 1.85:1 sobre o creme — no PDF ele carrega 97% do texto,
 * mas isso só funciona em impressão a 24pt. Na web ele é **cor de preenchimento**, nunca de
 * texto corrido. Texto usa `ink` (marrom); marca em texto usa `coral-700`/`coral-800`.
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
        /** Coral/pêssego da marca. `400` é o valor exato do PDF. */
        coral: {
          50: '#FFF7ED',
          100: '#FFEDD8',
          200: '#FFDCB8',
          300: '#FFC48C',
          400: '#FFA85A',
          500: '#F58E33',
          600: '#E0741B',
          700: '#B95A15',
          800: '#944818',
          900: '#783C17',
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
