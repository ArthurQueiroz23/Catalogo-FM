import type { Metadata } from 'next';
import { ProductGrid } from '@/components/product/ProductGrid';
import { api } from '@/lib/api';
import type { PageResponse, ProdutoSummaryResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

interface BuscaPageProps {
  // Next.js 16: searchParams é uma Promise (Async Request APIs) — precisa de await antes de usar.
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: BuscaPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const termo = q?.trim();
  return { title: termo ? `Busca por "${termo}"` : 'Busca' };
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const { q } = await searchParams;
  const termo = q?.trim() ?? '';

  const produtos = termo
    ? await api.get<PageResponse<ProdutoSummaryResponse>>(`/produtos?q=${encodeURIComponent(termo)}&size=48`, {
        cache: 'no-store',
      })
    : null;

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {termo ? (
          <>
            Resultados para <span className="text-brand-600">&ldquo;{termo}&rdquo;</span>
          </>
        ) : (
          'Buscar produtos'
        )}
      </h1>

      {produtos && (
        <p className="mt-1 text-sm text-gray-400">
          {produtos.totalElements} {produtos.totalElements === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>
      )}

      <div className="mt-6">
        {termo ? (
          <ProductGrid produtos={produtos?.content ?? []} />
        ) : (
          <p className="py-12 text-center text-sm text-gray-500">Digite um termo na busca para encontrar produtos.</p>
        )}
      </div>
    </div>
  );
}
