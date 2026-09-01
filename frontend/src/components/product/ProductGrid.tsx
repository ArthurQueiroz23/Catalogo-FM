import { PackageOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ProdutoSummaryResponse } from '@/types/api';
import { ProductCard } from './ProductCard';

/** Grade única de peças — as mesmas colunas na home, no catálogo, na categoria e na busca. */
const COLUNAS = 'grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6';

export function ProductGrid({
  produtos,
  mensagemVazia = 'Nenhuma peça encontrada por aqui.',
}: {
  produtos: ProdutoSummaryResponse[];
  mensagemVazia?: string;
}) {
  if (produtos.length === 0) {
    return <EmptyState icon={PackageOpen} title={mensagemVazia} />;
  }

  return (
    <div className={COLUNAS}>
      {produtos.map((produto) => (
        <ProductCard key={produto.id} produto={produto} />
      ))}
    </div>
  );
}

/**
 * Esqueleto com a mesma grade da lista real, usado pelos `loading.tsx` das rotas do catálogo.
 * Como as páginas públicas são renderizadas no servidor a cada acesso (`force-dynamic`), sem
 * isto a navegação ficava alguns instantes sem resposta visível nenhuma.
 */
export function ProductGridSkeleton({ quantidade = 8 }: { quantidade?: number }) {
  return (
    <div className={COLUNAS}>
      {Array.from({ length: quantidade }, (_, indice) => (
        <div key={indice} className="superficie-solida overflow-hidden">
          <Skeleton className="aspect-[4/5] w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
