import type { Metadata, Viewport } from 'next';
import { Nunito, Shantell_Sans } from 'next/font/google';
import { siteConfig } from '@/lib/config';
import { Providers } from './providers';
import './globals.css';

/**
 * Duas fontes, dois papéis (ver `docs/DESIGN_SYSTEM.md` §3.2).
 *
 * `fonteMarca` — Shantell Sans, a manuscrita que representa o catálogo impresso (feito na
 * fonte Ballpoint do Canva, proprietária e não licenciável para web). Ela é **voz de marca**:
 * logotipo, títulos e chamadas. Usá-la também em texto corrido, formulário e tabela era o que
 * mais fazia o site parecer protótipo — manuscrita cansa em bloco e some em 15px no celular.
 *
 * `fonteUi` — Nunito, humanista de terminações arredondadas. É a fonte padrão do `body`:
 * carrega leitura, campos, preços, listas e o painel inteiro. Foi escolhida por conversar com
 * o traço redondo da marca sem imitá-lo, e por ter uma família larga o bastante (400–800)
 * para sustentar hierarquia sem trocar de fonte.
 */
const fonteMarca = Shantell_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-marca',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const fonteUi = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-ui',
  display: 'swap',
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
    // `data-scroll-behavior` é como o Next.js reconhece o `scroll-behavior: smooth` que o
    // `globals.css` define — sem ele, o roteador avisa no console e a troca de rota rola
    // suavemente até o topo em vez de saltar.
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${fonteMarca.variable} ${fonteUi.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
