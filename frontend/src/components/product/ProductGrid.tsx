import { PackageOpen } from 'lucide-react';
import type { ProdutoSummaryResponse } from '@/types/api';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  produtos,
  mensagemVazia = 'Nenhuma peça encontrada por aqui.',
}: {
  produtos: ProdutoSummaryResponse[];
  mensagemVazia?: string;
}) {
  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-peca bg-creme-50/70 py-16 text-center">
        <PackageOpen className="h-10 w-10 text-coral-300" />
        <p className="text-[0.9375rem] font-semibold text-ink-600">{mensagemVazia}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {produtos.map((produto) => (
        <ProductCard key={produto.id} produto={produto} />
      ))}
    </div>
  );
}
