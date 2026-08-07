/** Configuração pública do site, lida das variáveis de ambiente — ver frontend/.env.example. */
export const siteConfig = {
  /**
   * URL pública do catálogo, sem barra final. Usada como `metadataBase` (Open Graph) e no
   * sitemap/robots. Sem isso, o preview do link compartilhado no WhatsApp — o canal principal da
   * loja — sai sem imagem, porque as URLs de OG seriam relativas.
   */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
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
