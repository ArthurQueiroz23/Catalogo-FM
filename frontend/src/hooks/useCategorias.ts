import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as adminApi from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import type { CategoriaRequest, ReordenarItemRequest } from '@/types/api';
import { queryKeys } from './query-keys';

function mensagemErro(erro: unknown, fallback: string): string {
  return erro instanceof ApiError ? erro.message : fallback;
}

export function useCategorias() {
  return useQuery({
    queryKey: queryKeys.categorias,
    queryFn: adminApi.listarCategoriasAdmin,
  });
}

export function useCategoria(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.categoria(id ?? -1),
    queryFn: () => adminApi.buscarCategoria(id as number),
    enabled: id !== undefined,
  });
}

export function useCriarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CategoriaRequest) => adminApi.criarCategoria(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      toast.success('Categoria criada com sucesso.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível criar a categoria.')),
  });
}

export function useAtualizarCategoria(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CategoriaRequest) => adminApi.atualizarCategoria(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      queryClient.invalidateQueries({ queryKey: queryKeys.categoria(id) });
      toast.success('Categoria atualizada com sucesso.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível atualizar a categoria.')),
  });
}

export function useExcluirCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.excluirCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
      toast.success('Categoria excluída.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível excluir a categoria.')),
  });
}

export function useReordenarCategorias() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itens: ReordenarItemRequest[]) => adminApi.reordenarCategorias(itens),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
    },
    onError: (erro) => {
      toast.error(mensagemErro(erro, 'Não foi possível salvar a nova ordem.'));
      queryClient.invalidateQueries({ queryKey: queryKeys.categorias });
    },
  });
}
