/** Configuração pública do site, lida das variáveis de ambiente — ver frontend/.env.example. */
export const siteConfig = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? '',
};

export function montarLinkInstagram(handle: string): string {
  return `https://instagram.com/${handle}`;
}
