/**
 * URL pública do catálogo, sem barra final. Usada como `metadataBase` (Open Graph) e no
 * sitemap/robots. Sem ela, o preview do link compartilhado no WhatsApp — o canal principal da
 * loja — sai sem imagem, porque as URLs de OG seriam relativas.
 *
 * Como em `lib/api.ts`, a ausência derruba o build de produção em vez de cair para localhost:
 * um catálogo publicado com `metadataBase` apontando para `localhost` gera links de produto que
 * não abrem para ninguém, e isso passaria despercebido até uma cliente reclamar.
 */
function resolverSiteUrl(): string {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configurada) {
    return configurada.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL não foi configurada. Defina o endereço público do catálogo, sem ' +
        'barra final (ex.: https://catalogo-fm.vercel.app), nas variáveis de ambiente do projeto ' +
        'e refaça o deploy. Localmente, preencha frontend/.env.local.',
    );
  }

  return 'http://localhost:3000';
}

/** Configuração pública do site, lida das variáveis de ambiente — ver frontend/.env.example. */
export const siteConfig = {
  siteUrl: resolverSiteUrl(),
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '',
  /** Contatos exibidos no rodapé — os mesmos da página de contato do catálogo impresso. */
  email: process.env.NEXT_PUBLIC_EMAIL ?? '',
  telefone: process.env.NEXT_PUBLIC_TELEFONE ?? '',
  endereco: process.env.NEXT_PUBLIC_ENDERECO ?? '',
};

export function montarLinkInstagram(handle: string): string {
  return `https://instagram.com/${handle}`;
}
