import type { Config } from 'tailwindcss';

/**
 * Paleta provisória — a Fruto da Malha ainda não repassou a identidade visual definitiva
 * (logo/paleta oficial). "brand" é o ponto único de ajuste quando isso chegar: trocar os
 * tons aqui propaga para todo o site sem precisar caçar cores espalhadas pelos componentes.
 * Ver docs/PROGRESS.md.
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4f2',
          100: '#ffe6e1',
          200: '#ffc9bd',
          300: '#ffa38f',
          400: '#fb7a5e',
          500: '#f2593a',
          600: '#df3f1f',
          700: '#b93018',
          800: '#932819',
          900: '#78241a',
        },
        accent: {
          50: '#f0faf6',
          100: '#d9f2e6',
          200: '#b3e5cd',
          300: '#83d1ae',
          400: '#54b78c',
          500: '#369b71',
          600: '#277c5b',
          700: '#21634a',
          800: '#1e4f3d',
          900: '#1a4133',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
      },
    },
  },
  plugins: [],
};

export default config;
