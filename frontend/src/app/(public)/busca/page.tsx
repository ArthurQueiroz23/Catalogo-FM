import type { Metadata } from 'next';
import { ProductGrid } from '@/components/product/ProductGrid';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { api } from '@/lib/api';
import { PRODUTOS_POR_PAGINA, lerNumeroDaPagina } from '@/lib/paginacao';
import type { PageResponse, ProdutoSummaryResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

interface BuscaPageProps {
  // Next.js 16: searchParams é uma Promise (Async Request APIs) — precisa de await antes de usar.
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: BuscaPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const termo = q?.trim();
  return {
    title: termo ? `Busca por "${termo}"` : 'Busca',
    // Páginas de resultado de busca não devem ser indexadas: geram infinitas URLs equivalentes
    // e competem com as páginas de categoria, que são o caminho real do catálogo.
    robots: { index: false, follow: true },
  };
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const { q, page: pageParam } = await searchParams;
  const termo = q?.trim() ?? '';
  const page = lerNumeroDaPagina(pageParam);

  const produtos = termo
    ? await api.get<PageResponse<ProdutoSummaryResponse>>(
        `/produtos?q=${encodeURIComponent(termo)}&page=${page}&size=${PRODUTOS_POR_PAGINA}`,
        { cache: 'no-store' }
      )
    : null;

  return (
    <div className="container py-8">
      <h1 className="titulo-secao">
        {termo ? (
          <>
            Resultados para <span className="text-ink-800">&ldquo;{termo}&rdquo;</span>
          </>
        ) : (
          'Buscar peças'
        )}
      </h1>

      {produtos && (
        <p className="mt-1.5 text-sm text-ink-400">
          {produtos.totalElements} {produtos.totalElements === 1 ? 'peça encontrada' : 'peças encontradas'}
        </p>
      )}

      <div className="mt-6">
        {termo ? (
          <ProductGrid
            produtos={produtos?.content ?? []}
            mensagemVazia={`Nenhuma peça encontrada para "${termo}".`}
          />
        ) : (
          <p className="py-16 text-center text-[0.9375rem] text-ink-500">
            Digite o nome ou a referência de uma peça para encontrá-la.
          </p>
        )}
      </div>

      {produtos && (
        <PaginationLinks
          page={produtos.page}
          totalPages={produtos.totalPages}
          construirHref={(destino) => {
            const parametros = new URLSearchParams({ q: termo });
            if (destino > 0) parametros.set('page', String(destino));
            return `/busca?${parametros.toString()}`;
          }}
        />
      )}
    </div>
  );
}
