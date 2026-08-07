'use client';

import { ImageOff, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { subtotalDoItem } from '@/lib/cart';
import { formatarPreco } from '@/lib/format';
import { useCartStore } from '@/store/cart-store';
import type { CartItem } from '@/types/cart';
import { QuantityStepper } from '@/components/ui/QuantityStepper';

export function CartItemRow({ item }: { item: CartItem }) {
  const atualizarQuantidade = useCartStore((state) => state.atualizarQuantidade);
  const removerProduto = useCartStore((state) => state.removerProduto);

  return (
    <div className="flex flex-col gap-4 rounded-peca bg-creme-50/70 p-4 sm:flex-row">
      <Link
        href={`/produto/${item.referencia}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-peca bg-creme-50 foco-marca"
      >
        {item.imagemUrl ? (
          <Image src={item.imagemUrl} alt={item.nome} fill sizes="96px" className="object-contain p-1" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-coral-200">
            <ImageOff className="h-6 w-6" />
          </span>
        )}
      </Link>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-coral-600">Ref. {item.referencia}</p>
            <Link
              href={`/produto/${item.referencia}`}
              className="rounded-pilula text-base font-bold text-ink-900 transition-colors hover:text-coral-700 foco-marca"
            >
              {item.nome}
            </Link>
            <p className="mt-0.5 text-sm text-ink-500">{formatarPreco(item.preco)} por peça</p>
          </div>
          <button
            type="button"
            onClick={() => removerProduto(item.produtoId)}
            aria-label={`Remover ${item.nome} da seleção`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pilula text-ink-400
              transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {item.tamanhos.map((tamanho) => (
            <div
              key={tamanho.tamanhoId}
              className="flex items-center gap-2 rounded-pilula bg-creme py-1 pl-3.5 pr-1"
            >
              <span className="text-sm font-bold text-ink-700">{tamanho.tamanhoNome}</span>
              <QuantityStepper
                value={tamanho.quantidade}
                onChange={(valor) => atualizarQuantidade(item.produtoId, tamanho.tamanhoId, valor)}
                label={`${item.nome} tamanho ${tamanho.tamanhoNome}`}
              />
            </div>
          ))}
        </div>

        <p className="mt-3 text-[0.9375rem] font-bold text-ink-900">
          Subtotal: {formatarPreco(subtotalDoItem(item))}
        </p>
      </div>
    </div>
  );
}
