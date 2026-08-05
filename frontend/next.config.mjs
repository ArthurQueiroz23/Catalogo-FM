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
};

export default nextConfig;
