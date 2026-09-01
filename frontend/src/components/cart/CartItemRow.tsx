'use client';

import { Camera, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { subtotalDoItem } from '@/lib/cart';
import { formatarPreco } from '@/lib/format';
import { useCartStore } from '@/store/cart-store';
import type { CartItem } from '@/types/cart';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ItemObservacao } from './ItemObservacao';

/**
 * Linha de uma peça na seleção: foto, identificação, um seletor de quantidade por tamanho, a
 * observação da cliente sobre aquela peça e o subtotal. O subtotal fica no rodapé da linha,
 * alinhado à direita e separado por um fio — antes era mais uma frase solta no meio do bloco,
 * do mesmo peso do resto.
 *
 * A ordem é intencional: quantidade → recado → valor. O recado nasce da escolha das
 * quantidades ("quero uma azul e uma branca" só faz sentido depois de escolher duas), e o
 * subtotal fecha o bloco.
 */
export function CartItemRow({ item }: { item: CartItem }) {
  const atualizarQuantidade = useCartStore((state) => state.atualizarQuantidade);
  const removerProduto = useCartStore((state) => state.removerProduto);

  return (
    <article className="superficie-solida p-4 sm:p-5">
      <div className="flex gap-4">
        <Link
          href={`/produto/${item.referencia}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-creme-100 ring-1 ring-coral-100 foco-marca"
        >
          {item.imagemUrl ? (
            <Image src={item.imagemUrl} alt={item.nome} fill sizes="96px" className="object-contain p-1.5" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-coral-200">
              <Camera className="h-6 w-6" aria-hidden="true" />
            </span>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-extrabold uppercase tracking-[0.12em] text-coral-800">
                Ref. {item.referencia}
              </p>
              <Link
                href={`/produto/${item.referencia}`}
                className="mt-0.5 block rounded-pilula font-bold leading-snug text-ink-900 transition-colors
                  hover:text-coral-800 foco-marca"
              >
                {item.nome}
              </Link>
              <p className="mt-1 text-[0.8125rem] tabular-nums text-ink-500">
                {formatarPreco(item.preco)} por peça
              </p>
            </div>

            <button
              type="button"
              onClick={() => removerProduto(item.produtoId)}
              aria-label={`Remover ${item.nome} da seleção`}
              className="btn-icone"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.tamanhos.map((tamanho) => (
          <div
            key={tamanho.tamanhoId}
            className="flex items-center gap-2 rounded-pilula bg-creme-100 py-1 pl-3.5 pr-1 ring-1 ring-coral-100"
          >
            <span className="text-sm font-extrabold text-ink-700">{tamanho.tamanhoNome}</span>
            <QuantityStepper
              value={tamanho.quantidade}
              onChange={(valor) => atualizarQuantidade(item.produtoId, tamanho.tamanhoId, valor)}
              label={`${item.nome} tamanho ${tamanho.tamanhoNome}`}
            />
          </div>
        ))}
      </div>

      <ItemObservacao item={item} />

      <p className="mt-4 flex items-baseline justify-end gap-2 border-t border-coral-100 pt-3">
        <span className="text-[0.8125rem] font-semibold text-ink-500">Subtotal</span>
        <span className="text-lg font-extrabold tabular-nums text-ink-900">
          {formatarPreco(subtotalDoItem(item))}
        </span>
      </p>
    </article>
  );
}
