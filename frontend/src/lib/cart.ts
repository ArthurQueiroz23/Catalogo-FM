import type { CartItem } from '@/types/cart';

/** Soma das quantidades de todos os tamanhos de UM item (produto) do carrinho. */
export function quantidadeDoItem(item: CartItem): number {
  return item.tamanhos.reduce((soma, t) => soma + t.quantidade, 0);
}

/** Subtotal de UM item (produto) — preço unitário × soma das quantidades de todos os tamanhos. */
export function subtotalDoItem(item: CartItem): number {
  return item.preco * quantidadeDoItem(item);
}

/** Valor total do carrinho — soma dos subtotais de todos os produtos. */
export function valorTotalCarrinho(itens: CartItem[]): number {
  return itens.reduce((soma, item) => soma + subtotalDoItem(item), 0);
}

/** Quantidade total de peças no carrinho, somando todos os tamanhos de todos os produtos. */
export function quantidadeTotalPecas(itens: CartItem[]): number {
  return itens.reduce((soma, item) => soma + quantidadeDoItem(item), 0);
}
