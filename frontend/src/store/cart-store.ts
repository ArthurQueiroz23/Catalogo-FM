import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, CartTamanhoQuantidade } from '@/types/cart';

/**
 * Teto do texto da observação. O pedido sai como link `wa.me?text=...`, e a mensagem inteira
 * viaja na URL — sem um limite por item, dez recados longos poderiam estourar o tamanho que o
 * WhatsApp aceita e o link simplesmente não abriria. 280 caracteres cobrem com folga o tipo de
 * recado real ("separar o 40", "uma azul e uma branca").
 */
export const LIMITE_OBSERVACAO = 280;

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
  /**
   * Grava (ou apaga) a observação de UM produto. Texto em branco apaga — assim "adicionar",
   * "editar" e "remover" da interface são a mesma operação, e não três caminhos diferentes.
   */
  definirObservacao: (produtoId: number, observacao: string) => void;
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

      definirObservacao: (produtoId, observacao) =>
        set((state) => {
          const texto = observacao.trim().slice(0, LIMITE_OBSERVACAO);
          return {
            itens: state.itens.map((item) => {
              if (item.produtoId !== produtoId) return item;
              if (!texto) {
                // Apaga a chave em vez de guardar string vazia: o item volta a ser exatamente
                // o que era antes de existir observação.
                const { observacao: _removida, ...semObservacao } = item;
                return semObservacao;
              }
              return { ...item, observacao: texto };
            }),
          };
        }),

      limparCarrinho: () => set({ itens: [] }),
    }),
    {
      name: 'frutodamalha-carrinho',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Diz se o carrinho salvo no `localStorage` já foi lido. Componentes que mostram o conteúdo da
 * seleção precisam esperar por isto antes de confiar em `itens` — no HTML gerado no servidor a
 * seleção é sempre vazia, e renderizá-la como definitiva faria a tela piscar "está vazia" para
 * quem tem peças escolhidas.
 *
 * `useCartStore.persist` fica `undefined` durante a renderização no servidor (não há
 * `localStorage` em Node.js), então todo acesso é opcional.
 */
export function useCartHasHydrated(): boolean {
  // `useSyncExternalStore` é a API do React feita exatamente para este caso: ela renderiza o
  // snapshot do servidor (`false`) durante a hidratação e só então passa a ler o snapshot do
  // cliente. Antes, o estado inicial lia `hasHydrated()` direto — e como o `localStorage` é
  // síncrono, o zustand já havia reidratado nesse instante: o cliente devolvia `true` contra o
  // `false` do HTML do servidor e o React derrubava a tela de seleção com "Hydration failed".
  return useSyncExternalStore(
    (aoReidratar) => useCartStore.persist?.onFinishHydration(aoReidratar) ?? (() => {}),
    () => useCartStore.persist?.hasHydrated() ?? false,
    () => false
  );
}
