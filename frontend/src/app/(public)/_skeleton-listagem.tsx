import { ProductGridSkeleton } from '@/components/product/ProductGrid';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Esqueleto das páginas de listagem (catálogo, categoria, busca).
 *
 * As rotas públicas são renderizadas no servidor a cada acesso (`force-dynamic`, ver
 * docs/ARCHITECTURE.md §3.3), então entre o clique e a resposta existe uma espera real. Sem um
 * `loading.tsx`, essa espera acontecia com a tela anterior congelada — o toque parecia não ter
 * funcionado. O arquivo começa com `_` para o Next não tratá-lo como rota.
 */
export function SkeletonListagem() {
  return (
    <div className="container secao-compacta">
      <Skeleton className="h-4 w-44" />
      <Skeleton className="mt-5 h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-full max-w-md" />
      <div className="mt-9">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
