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
      href="/carrinho"
      aria-label={`Carrinho, ${totalPecas} ${totalPecas === 1 ? 'peça' : 'peças'}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100"
    >
      <ShoppingBag className="h-5 w-5" />
      {totalPecas > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-semibold text-white">
          {totalPecas}
        </span>
      )}
    </Link>
  );
}
