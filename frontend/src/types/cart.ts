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
}
