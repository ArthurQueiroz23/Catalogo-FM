import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { siteConfig } from '@/lib/config';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const DESCRICAO =
  'Catálogo online de roupas infantis Fruto da Malha. Veja as peças, escolha tamanhos e quantidades e envie sua seleção pelo WhatsApp.';

export const metadata: Metadata = {
  // metadataBase resolve as URLs relativas de Open Graph para absolutas. Sem isso, o preview do
  // link ao compartilhar no WhatsApp/Instagram vem sem imagem.
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: 'Fruto da Malha — Roupas Infantis',
    template: '%s | Fruto da Malha',
  },
  description: DESCRICAO,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Fruto da Malha',
    title: 'Fruto da Malha — Roupas Infantis',
    description: DESCRICAO,
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
