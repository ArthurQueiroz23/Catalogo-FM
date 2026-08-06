/**
 * Paginação das listagens públicas (`/categoria/[slug]`, `/busca`).
 *
 * Antes essas telas pediam `size=48` e não paginavam: a partir do 49º produto de uma categoria,
 * as peças simplesmente não apareciam no catálogo e nada avisava a administradora. Como o
 * propósito do sistema é justamente nunca deixar um produto de fora, a listagem agora pagina de
 * verdade — com URL própria por página, para o buscador conseguir rastrear o catálogo inteiro.
 */

/** Múltiplo de 2, 3 e 4 — fecha as linhas do grid em todos os breakpoints sem sobra. */
export const PRODUTOS_POR_PAGINA = 24;

/**
 * Converte o `?page=` da URL (texto livre, digitado por qualquer pessoa) no índice base 0 que o
 * backend espera. Qualquer valor inválido — vazio, negativo, "abc", "1e9" — vira a primeira
 * página, em vez de quebrar a listagem.
 */
export function lerNumeroDaPagina(valor: string | undefined): number {
  const numero = Number(valor);
  if (!Number.isSafeInteger(numero) || numero < 0) {
    return 0;
  }
  return numero;
}
