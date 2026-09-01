/**
 * Modelo do carrinho — ver docs do produto: cada item de carrinho é UM produto que pode ter
 * quantidades diferentes por tamanho (ex.: referência 000180 com P→2, M→3, G→5 na mesma linha).
 * Não há pagamento nem checkout: o carrinho só organiza o pedido para o envio via WhatsApp.
 */

export interface CartTamanhoQuantidade {
  tamanhoId: number;
  tamanhoNome: string;
  quantidade: number;
}

export interface CartItem {
  produtoId: number;
  referencia: string;
  nome: string;
  preco: number;
  imagemUrl: string | null;
  /** Uma entrada por tamanho escolhido; nunca deve haver duas entradas para o mesmo tamanhoId. */
  tamanhos: CartTamanhoQuantidade[];
  /**
   * Recado da cliente **sobre esta peça** — "quero uma azul e uma branca", "separar o 40",
   * "se possível com manga curta". Vai junto do produto na mensagem do WhatsApp.
   *
   * Fica no item, e não no carrinho inteiro, porque a vendedora precisa saber a qual peça o
   * recado se refere. Como o carrinho guarda **um item por produto** (com todos os tamanhos
   * dentro), uma observação por item é uma observação por produto.
   *
   * Opcional de propósito: carrinhos salvos no `localStorage` antes desta funcionalidade não
   * têm o campo, e precisam continuar carregando sem erro. Ausente e vazio significam a mesma
   * coisa — "sem observação".
   */
  observacao?: string;
}
