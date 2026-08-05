import type { ProdutoSummaryResponse } from '@/types/api';
import { ProductCard } from './ProductCard';

export function ProductGrid({ produtos }: { produtos: ProdutoSummaryResponse[] }) {
  if (produtos.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-500">Nenhum produto encontrado.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {produtos.map((produto) => (
        <ProductCard key={produto.id} produto={produto} />
      ))}
    </div>
  );
}
