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
    <div className="flex flex-col gap-4 border-b border-gray-100 py-5 sm:flex-row">
      <Link href={`/produto/${item.referencia}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
        {item.imagemUrl ? (
          <Image src={item.imagemUrl} alt={item.nome} fill sizes="96px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-gray-300">
            <ImageOff className="h-6 w-6" />
          </span>
        )}
      </Link>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/produto/${item.referencia}`} className="font-semibold text-gray-900 hover:text-brand-600">
              {item.nome}
            </Link>
            <p className="text-xs text-gray-400">Ref. {item.referencia}</p>
            <p className="mt-0.5 text-sm text-gray-600">{formatarPreco(item.preco)} / unidade</p>
          </div>
          <button
            type="button"
            onClick={() => removerProduto(item.produtoId)}
            aria-label={`Remover ${item.nome} do carrinho`}
            className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {item.tamanhos.map((tamanho) => (
            <div key={tamanho.tamanhoId} className="flex items-center gap-2 rounded-full bg-gray-50 py-1 pl-3 pr-1">
              <span className="text-xs font-semibold text-gray-600">{tamanho.tamanhoNome}</span>
              <QuantityStepper
                value={tamanho.quantidade}
                onChange={(valor) => atualizarQuantidade(item.produtoId, tamanho.tamanhoId, valor)}
                label={`${item.nome} tamanho ${tamanho.tamanhoNome}`}
              />
            </div>
          ))}
        </div>

        <p className="mt-3 text-sm font-semibold text-gray-900">Subtotal: {formatarPreco(subtotalDoItem(item))}</p>
      </div>
    </div>
  );
}
