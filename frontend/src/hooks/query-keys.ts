import type { FiltroProdutosAdmin } from '@/lib/admin-api';

/** Chaves de cache do React Query centralizadas — evita strings mágicas espalhadas nos hooks. */
export const queryKeys = {
  categorias: ['admin', 'categorias'] as const,
  categoria: (id: number) => ['admin', 'categorias', id] as const,
  colecoes: ['admin', 'colecoes'] as const,
  colecao: (id: number) => ['admin', 'colecoes', id] as const,
  tamanhos: ['admin', 'tamanhos'] as const,
  produtos: (filtro: FiltroProdutosAdmin) => ['admin', 'produtos', filtro] as const,
  produto: (id: number) => ['admin', 'produtos', id] as const,
  dashboard: ['admin', 'dashboard'] as const,
};
