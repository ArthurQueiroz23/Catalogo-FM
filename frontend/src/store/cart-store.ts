import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, CartTamanhoQuantidade } from '@/types/cart';

export interface DadosProdutoCarrinho {
  produtoId: number;
  referencia: string;
  nome: string;
  preco: number;
  imagemUrl: string | null;
}

interface CartState {
  itens: CartItem[];
  /**
   * Adiciona (ou funde com um item já existente) um produto com uma ou mais linhas de
   * tamanho+quantidade — é assim que a página do produto envia, em uma única ação, todas as
   * quantidades escolhidas por tamanho (ex.: P→2, M→3, G→5 do mesmo produto).
   */
  adicionarItem: (produto: DadosProdutoCarrinho, tamanhos: CartTamanhoQuantidade[]) => void;
  /** Define a quantidade exata de um tamanho já presente no carrinho; 0 remove a linha. */
  atualizarQuantidade: (produtoId: number, tamanhoId: number, quantidade: number) => void;
  /** Remove apenas um tamanho de um produto (remove o produto inteiro se não sobrar nenhum). */
  removerTamanho: (produtoId: number, tamanhoId: number) => void;
  /** Remove o produto inteiro do carrinho, com todos os seus tamanhos. */
  removerProduto: (produtoId: number) => void;
  limparCarrinho: () => void;
}

function mesclarTamanhos(existentes: CartTamanhoQuantidade[], novos: CartTamanhoQuantidade[]): CartTamanhoQuantidade[] {
  const porId = new Map(existentes.map((t) => [t.tamanhoId, { ...t }]));
  for (const novo of novos) {
    if (novo.quantidade <= 0) continue;
    const atual = porId.get(novo.tamanhoId);
    if (atual) {
      atual.quantidade += novo.quantidade;
    } else {
      porId.set(novo.tamanhoId, { ...novo });
    }
  }
  return Array.from(porId.values());
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      itens: [],

      adicionarItem: (produto, tamanhos) =>
        set((state) => {
          const tamanhosValidos = tamanhos.filter((t) => t.quantidade > 0);
          if (tamanhosValidos.length === 0) {
            return state;
          }

          const existente = state.itens.find((item) => item.produtoId === produto.produtoId);
          if (!existente) {
            const novoItem: CartItem = { ...produto, tamanhos: tamanhosValidos };
            return { itens: [...state.itens, novoItem] };
          }

          return {
            itens: state.itens.map((item) =>
              item.produtoId === produto.produtoId
                ? { ...item, tamanhos: mesclarTamanhos(item.tamanhos, tamanhosValidos) }
                : item
            ),
          };
        }),

      atualizarQuantidade: (produtoId, tamanhoId, quantidade) =>
        set((state) => ({
          itens: state.itens
            .map((item) => {
              if (item.produtoId !== produtoId) return item;
              const tamanhos = quantidade <= 0
                ? item.tamanhos.filter((t) => t.tamanhoId !== tamanhoId)
                : item.tamanhos.map((t) => (t.tamanhoId === tamanhoId ? { ...t, quantidade } : t));
              return { ...item, tamanhos };
            })
            .filter((item) => item.tamanhos.length > 0),
        })),

      removerTamanho: (produtoId, tamanhoId) =>
        set((state) => ({
          itens: state.itens
            .map((item) =>
              item.produtoId === produtoId
                ? { ...item, tamanhos: item.tamanhos.filter((t) => t.tamanhoId !== tamanhoId) }
                : item
            )
            .filter((item) => item.tamanhos.length > 0),
        })),

      removerProduto: (produtoId) =>
        set((state) => ({ itens: state.itens.filter((item) => item.produtoId !== produtoId) })),

      limparCarrinho: () => set({ itens: [] }),
    }),
    {
      name: 'frutodamalha-carrinho',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * O zustand `persist` reidrata o carrinho do localStorage de forma assíncrona (para não gerar
 * mismatch de hidratação entre servidor e cliente no Next.js) — componentes que renderizam o
 * conteúdo do carrinho devem esperar esse hook antes de confiar em `itens`, ou verão um estado
 * vazio por um instante mesmo com itens salvos.
 *
 * `useCartStore.persist` fica `undefined` durante a pré-renderização estática no servidor (não
 * há `localStorage` em Node.js) — nesse caso o valor correto é "ainda não hidratado", o mesmo
 * estado inicial que o cliente usa antes de reidratar, então o acesso é sempre opcional.
 */
export function useCartHasHydrated(): boolean {
  const [hidratado, setHidratado] = useState(() => useCartStore.persist?.hasHydrated() ?? false);

  useEffect(() => {
    return useCartStore.persist?.onFinishHydration(() => setHidratado(true));
  }, []);

  return hidratado;
}
