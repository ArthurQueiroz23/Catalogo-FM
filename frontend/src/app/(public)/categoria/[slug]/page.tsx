import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { ApiError, api } from '@/lib/api';
import { PRODUTOS_POR_PAGINA, lerNumeroDaPagina } from '@/lib/paginacao';
import type { CategoriaResponse, PageResponse, ProdutoSummaryResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

interface CategoriaPageProps {
  // Next.js 16: params e searchParams são Promise (Async Request APIs) — precisam de await.
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function buscarCategoria(slug: string): Promise<CategoriaResponse | null> {
  try {
    return await api.get<CategoriaResponse>(`/categorias/${slug}`, { cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({ params }: CategoriaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await buscarCategoria(slug);
  if (!categoria) {
    return { title: 'Categoria não encontrada' };
  }
  return {
    title: categoria.nome,
    description: categoria.descricao ?? `Peças da categoria ${categoria.nome} no catálogo Fruto da Malha.`,
    alternates: { canonical: `/categoria/${categoria.slug}` },
  };
}

export default async function CategoriaPage({ params, searchParams }: CategoriaPageProps) {
  const { slug } = await params;
  const categoria = await buscarCategoria(slug);
  if (!categoria) {
    notFound();
  }

  const page = lerNumeroDaPagina((await searchParams).page);

  const produtos = await api.get<PageResponse<ProdutoSummaryResponse>>(
    `/produtos?categoria=${encodeURIComponent(categoria.slug)}&page=${page}&size=${PRODUTOS_POR_PAGINA}`,
    { cache: 'no-store' }
  );

  return (
    <div className="container secao-compacta">
      <PageHeader
        eyebrow="Categoria"
        title={categoria.nome}
        description={categoria.descricao}
        contagem={{ valor: produtos.totalElements, singular: 'peça', plural: 'peças' }}
        migalhas={[
          { rotulo: 'Início', href: '/' },
          { rotulo: 'Categorias', href: '/categoria' },
          { rotulo: categoria.nome },
        ]}
      />

      <ProductGrid
        produtos={produtos.content}
        mensagemVazia="Nenhuma peça publicada nesta categoria por enquanto."
      />

      <PaginationLinks
        page={produtos.page}
        totalPages={produtos.totalPages}
        construirHref={(destino) =>
          destino === 0 ? `/categoria/${categoria.slug}` : `/categoria/${categoria.slug}?page=${destino}`
        }
      />
    </div>
  );
}
