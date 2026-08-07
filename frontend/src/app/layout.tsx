import type { Metadata, Viewport } from 'next';
import { Shantell_Sans } from 'next/font/google';
import { siteConfig } from '@/lib/config';
import { Providers } from './providers';
import './globals.css';

/**
 * O catálogo impresso é 100% manuscrito (fonte Ballpoint, do Canva — proprietária e não
 * licenciável para web). Shantell Sans é a substituta: é a única manuscrita variável do Google
 * Fonts desenhada para uso em interface, então preserva a personalidade do catálogo sem
 * inviabilizar leitura de texto corrido, formulários e números.
 * Ver `docs/DESIGN_SYSTEM.md`.
 */
const fonteMarca = Shantell_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-marca',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const DESCRICAO =
  'Catálogo de roupas infantis Fruto da Malha. Veja as peças, escolha tamanhos e quantidades e envie sua seleção pelo WhatsApp.';

export const metadata: Metadata = {
  // metadataBase resolve as URLs relativas de Open Graph para absolutas. Sem isso, o preview do
  // link ao compartilhar no WhatsApp/Instagram vem sem imagem.
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: 'Fruto da Malha — Vestindo carinho',
    template: '%s | Fruto da Malha',
  },
  description: DESCRICAO,
  applicationName: 'Fruto da Malha',
  icons: {
    icon: '/marca/icone-512.png',
    apple: '/marca/icone-512.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Fruto da Malha',
    title: 'Fruto da Malha — Vestindo carinho',
    description: DESCRICAO,
    images: [{ url: '/marca/logo.png', width: 236, height: 293, alt: 'Fruto da Malha' }],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#FFFBEF',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fonteMarca.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
