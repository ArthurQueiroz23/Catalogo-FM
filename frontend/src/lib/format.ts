const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata um valor numérico como moeda brasileira (ex.: 45.9 -> "R$ 45,90"). */
export function formatarPreco(valor: number): string {
  return formatadorMoeda.format(valor);
}
