import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { siteConfig } from '@/lib/config';
import type { CategoriaResponse, PageResponse, ProdutoSummaryResponse } from '@/types/api';

/**
 * Sitemap gerado a partir do catálogo real: toda categoria ativa e todo produto ativo entram
 * aqui automaticamente quando a administradora os cadastra — sem nenhum passo manual, que é a
 * premissa do produto.
 *
 * Revalidado de hora em hora: um sitemap não precisa ser instantâneo (diferente das páginas do
 * catálogo, que são sempre `no-store`) e assim os buscadores não disparam uma varredura completa
 * da API a cada visita do robô.
 */
export const revalidate = 3600;

/** Teto de segurança: 60 é o `size` máximo aceito pelo backend, logo até 6.000 produtos. */
const MAX_PAGINAS = 100;
const TAMANHO_PAGINA = 60;

async function buscarTodosOsProdutos(): Promise<ProdutoSummaryResponse[]> {
  const produtos: ProdutoSummaryResponse[] = [];

  for (let page = 0; page < MAX_PAGINAS; page += 1) {
    const pagina = await api.get<PageResponse<ProdutoSummaryResponse>>(
      `/produtos?page=${page}&size=${TAMANHO_PAGINA}`
    );
    produtos.push(...pagina.content);
    if (pagina.last || pagina.content.length === 0) break;
  }

  return produtos;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginasFixas: MetadataRoute.Sitemap = [
    { url: siteConfig.siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteConfig.siteUrl}/categoria`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  try {
    const [categorias, produtos] = await Promise.all([
      api.get<CategoriaResponse[]>('/categorias'),
      buscarTodosOsProdutos(),
    ]);

    return [
      ...paginasFixas,
      ...categorias.map((categoria) => ({
        url: `${siteConfig.siteUrl}/categoria/${categoria.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...produtos.map((produto) => ({
        url: `${siteConfig.siteUrl}/produto/${encodeURIComponent(produto.referencia)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // A API pode estar indisponível no momento do build (na Vercel, o backend da Railway não é
    // pré-requisito do deploy do frontend). Um sitemap reduzido é melhor que um build quebrado —
    // a próxima revalidação já traz o catálogo completo.
    return paginasFixas;
  }
}
