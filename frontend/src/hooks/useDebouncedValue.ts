import { useEffect, useState } from 'react';

/** Atrasa a propagação de um valor (ex.: texto de busca) para evitar uma requisição por tecla. */
export function useDebouncedValue<T>(valor: T, atrasoMs = 350): T {
  const [valorAtrasado, setValorAtrasado] = useState(valor);

  useEffect(() => {
    const timeoutId = setTimeout(() => setValorAtrasado(valor), atrasoMs);
    return () => clearTimeout(timeoutId);
  }, [valor, atrasoMs]);

  return valorAtrasado;
}
