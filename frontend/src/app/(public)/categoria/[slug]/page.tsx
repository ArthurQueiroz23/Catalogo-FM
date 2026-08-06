import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
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
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{categoria.nome}</h1>
      {categoria.descricao && <p className="mt-2 max-w-2xl text-gray-600">{categoria.descricao}</p>}
      <p className="mt-1 text-sm text-gray-400">
        {produtos.totalElements} {produtos.totalElements === 1 ? 'produto' : 'produtos'}
      </p>

      <div className="mt-6">
        <ProductGrid produtos={produtos.content} />
      </div>

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
