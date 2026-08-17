import type { Metadata } from 'next';
import { ProductGrid } from '@/components/product/ProductGrid';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { api } from '@/lib/api';
import { PRODUTOS_POR_PAGINA, lerNumeroDaPagina } from '@/lib/paginacao';
import type { PageResponse, ProdutoSummaryResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo completo',
  description: 'Todas as peças Fruto da Malha para o seu negócio.',
  alternates: { canonical: '/produtos' },
};

interface ProdutosPageProps {
  // Next.js 16: searchParams é Promise (Async Request APIs) — precisa de await.
  searchParams: Promise<{ page?: string }>;
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const page = lerNumeroDaPagina((await searchParams).page);

  // Nenhum parâmetro de ordenação na URL: o backend já entrega por `ordem` ASC, que é a
  // sequência comercial definida pela loja. Ordenar aqui por nome, preço ou data desmontaria
  // a organização da vitrine. Essa sequência é uma regra interna — nada na interface a explica.
  const produtos = await api.get<PageResponse<ProdutoSummaryResponse>>(
    `/produtos?page=${page}&size=${PRODUTOS_POR_PAGINA}`,
    { cache: 'no-store' }
  );

  return (
    <div className="container py-8">
      <h1 className="titulo-secao">Todos os produtos</h1>
      <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-600">
        Todas as peças Fruto da Malha para o seu negócio.
      </p>
      <p className="mt-1.5 text-sm text-ink-400">
        {produtos.totalElements} {produtos.totalElements === 1 ? 'peça' : 'peças'}
      </p>

      <div className="mt-6">
        <ProductGrid
          produtos={produtos.content}
          mensagemVazia="Novas peças chegando em breve."
        />
      </div>

      <PaginationLinks
        page={produtos.page}
        totalPages={produtos.totalPages}
        construirHref={(destino) => (destino === 0 ? '/produtos' : `/produtos?page=${destino}`)}
      />
    </div>
  );
}
