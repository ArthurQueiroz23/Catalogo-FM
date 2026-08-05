import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ApiError, api } from '@/lib/api';
import type { CategoriaResponse, PageResponse, ProdutoSummaryResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

interface CategoriaPageProps {
  // Next.js 16: params é uma Promise (Async Request APIs) — precisa de await antes de usar.
  params: Promise<{ slug: string }>;
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
  return { title: categoria.nome, description: categoria.descricao ?? undefined };
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params;
  const categoria = await buscarCategoria(slug);
  if (!categoria) {
    notFound();
  }

  const produtos = await api.get<PageResponse<ProdutoSummaryResponse>>(
    `/produtos?categoria=${encodeURIComponent(categoria.slug)}&size=48`,
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
    </div>
  );
}
