import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // O painel é privado; /busca e /selecao geram URLs infinitas e equivalentes, que
        // competiriam com as páginas de categoria — que são o caminho real do catálogo.
        disallow: ['/admin', '/busca', '/selecao'],
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
