'use client';

import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { quantidadeTotalPecas } from '@/lib/cart';
import { useCartHasHydrated, useCartStore } from '@/store/cart-store';

export function CartButton() {
  const itens = useCartStore((state) => state.itens);
  const hidratado = useCartHasHydrated();

  const totalPecas = hidratado ? quantidadeTotalPecas(itens) : 0;

  return (
    <Link
      href="/selecao"
      aria-label={`Minha seleção, ${totalPecas} ${totalPecas === 1 ? 'peça' : 'peças'}`}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-pilula
        text-ink-700 transition-colors duration-200 hover:bg-coral-50 hover:text-coral-800 foco-marca"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalPecas > 0 && (
        <span
          className="absolute right-0 top-0.5 flex h-5 min-w-5 items-center justify-center
            rounded-pilula bg-coral-400 px-1 text-[11px] font-extrabold tabular-nums text-ink-900
            ring-2 ring-creme"
        >
          {totalPecas}
        </span>
      )}
    </Link>
  );
}
