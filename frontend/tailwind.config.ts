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
 * texto corrido. Texto usa `ink` (marrom); marca em texto usa `coral-800`.
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
        // Manuscrita em todo o site, como no catálogo. Shantell Sans é a única manuscrita
        // variável do Google Fonts desenhada para uso em interface — aguenta texto corrido,
        // formulários e números sem virar decoração ilegível.
        sans: ['var(--font-marca)', 'ui-rounded', 'Comic Sans MS', 'cursive'],
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
        peca: '0 2px 16px -4px rgba(117, 90, 73, 0.14)',
        flutuante: '0 8px 32px -8px rgba(117, 90, 73, 0.22)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
      keyframes: {
        surgir: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        surgir: 'surgir 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
