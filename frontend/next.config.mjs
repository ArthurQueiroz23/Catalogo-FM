/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudinary é a única origem de imagens de produto/categoria — restringir a hostname
    // evita que a otimização de imagem do Next seja usada como proxy aberto para outra origem.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      // A tela de "carrinho" passou a se chamar "seleção" (ela nunca representou uma compra —
      // ver docs/ARCHITECTURE.md §5). Mantido para não quebrar links já compartilhados.
      { source: '/carrinho', destination: '/selecao', permanent: true },
    ];
  },
};

export default nextConfig;
