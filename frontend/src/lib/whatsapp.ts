import type { CartItem } from '@/types/cart';
import { formatarPreco } from './format';
import { quantidadeTotalPecas, subtotalDoItem, valorTotalCarrinho } from './cart';

/**
 * Monta a mensagem de pedido enviada à vendedora pelo WhatsApp — o único "checkout" do sistema
 * (não há pagamento nem processamento financeiro embutido, ver docs/ARCHITECTURE.md). O formato
 * abaixo replica exatamente o modelo de mensagem definido para o produto: um bloco por produto,
 * com cada tamanho escolhido em sua própria linha, seguido do total de peças e valor do pedido.
 */
export function montarMensagemPedido(itens: CartItem[]): string {
  const blocos: string[] = ['Olá!', 'Gostaria de solicitar um orçamento.', 'Segue meu pedido:'];

  itens.forEach((item, index) => {
    blocos.push(`📦 Produto ${index + 1}`);
    blocos.push(`Referência: ${item.referencia}`);
    blocos.push(`Nome: ${item.nome}`);
    item.tamanhos.forEach((tamanho) => {
      blocos.push(`${tamanho.tamanhoNome} → ${tamanho.quantidade} unidades`);
    });
    blocos.push(`Valor unitário: ${formatarPreco(item.preco)}`);
    blocos.push(`Subtotal: ${formatarPreco(subtotalDoItem(item))}`);
  });

  blocos.push('Quantidade total de peças:');
  blocos.push(String(quantidadeTotalPecas(itens)));
  blocos.push('Valor total do pedido:');
  blocos.push(formatarPreco(valorTotalCarrinho(itens)));

  return blocos.join('\n\n');
}

/** Monta o link de click-to-chat do WhatsApp (`wa.me`) já com a mensagem codificada. */
export function montarLinkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
