import type { CartItem } from '@/types/cart';
import { formatarPreco } from './format';
import { quantidadeTotalPecas, subtotalDoItem, valorTotalCarrinho } from './cart';

/**
 * Monta a mensagem que a cliente envia à vendedora pelo WhatsApp — a única "saída" do sistema
 * (não há checkout, pagamento nem gravação de pedido; ver docs/ARCHITECTURE.md §5). Carrega todos
 * os dados que a vendedora precisa para responder: referência e nome de cada peça, quantidade por
 * tamanho, valor unitário, subtotal, a observação daquela peça (quando houver) e o total geral
 * da seleção.
 *
 * Formatação: linhas simples dentro de um mesmo produto e linha em branco entre produtos. O
 * WhatsApp não tem tabela nem negrito confiável em texto colado, então o agrupamento por espaço
 * em branco é o que mantém a mensagem legível quando a seleção tem muitas peças.
 *
 * A observação entra **dentro do bloco da própria peça**, como última linha, e nunca como um
 * recado geral no rodapé: a vendedora precisa saber a qual referência o "separar o 40" se
 * refere, e uma lista de observações soltas no fim obrigaria a cruzar informação de cabeça.
 */
export function montarMensagemSelecao(itens: CartItem[]): string {
  const blocos: string[] = ['Olá! Vi o catálogo e separei estas peças:'];

  for (const item of itens) {
    const observacao = item.observacao?.trim();

    const linhas = [
      `📦 Ref. ${item.referencia} — ${item.nome}`,
      ...item.tamanhos.map((tamanho) => `${tamanho.tamanhoNome}: ${tamanho.quantidade} un.`),
      `Valor unitário: ${formatarPreco(item.preco)}`,
      `Subtotal: ${formatarPreco(subtotalDoItem(item))}`,
      ...(observacao ? [`📝 Observação: ${observacao}`] : []),
    ];
    blocos.push(linhas.join('\n'));
  }

  blocos.push(
    [
      `Total de peças: ${quantidadeTotalPecas(itens)}`,
      `Valor total da seleção: ${formatarPreco(valorTotalCarrinho(itens))}`,
    ].join('\n')
  );

  return blocos.join('\n\n');
}

/** Monta o link de click-to-chat do WhatsApp (`wa.me`) já com a mensagem codificada. */
export function montarLinkWhatsApp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
