import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
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
    <div className="container secao-compacta">
      <PageHeader
        eyebrow="Busca"
        title={termo ? <>Resultados para &ldquo;{termo}&rdquo;</> : 'Buscar peças'}
        contagem={
          produtos
            ? { valor: produtos.totalElements, singular: 'peça encontrada', plural: 'peças encontradas' }
            : undefined
        }
        migalhas={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Busca' }]}
        acao={
          <Link href="/produtos" className="btn-secondary">
            Ver o catálogo completo
          </Link>
        }
      />

      {termo ? (
        <ProductGrid
          produtos={produtos?.content ?? []}
          mensagemVazia={`Nenhuma peça encontrada para "${termo}".`}
        />
      ) : (
        <EmptyState
          icon={Search}
          title="O que você procura?"
          description="Digite o nome ou a referência de uma peça no campo de busca do topo da página."
        />
      )}

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
