import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as adminApi from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import type { ColecaoRequest } from '@/types/api';
import { queryKeys } from './query-keys';

function mensagemErro(erro: unknown, fallback: string): string {
  return erro instanceof ApiError ? erro.message : fallback;
}

export function useColecoes() {
  return useQuery({
    queryKey: queryKeys.colecoes,
    queryFn: adminApi.listarColecoesAdmin,
  });
}

export function useColecao(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.colecao(id ?? -1),
    queryFn: () => adminApi.buscarColecao(id as number),
    enabled: id !== undefined,
  });
}

export function useCriarColecao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ColecaoRequest) => adminApi.criarColecao(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.colecoes });
      toast.success('Coleção criada com sucesso.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível criar a coleção.')),
  });
}

export function useAtualizarColecao(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ColecaoRequest) => adminApi.atualizarColecao(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.colecoes });
      queryClient.invalidateQueries({ queryKey: queryKeys.colecao(id) });
      toast.success('Coleção atualizada com sucesso.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível atualizar a coleção.')),
  });
}

export function useExcluirColecao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.excluirColecao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.colecoes });
      toast.success('Coleção excluída.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível excluir a coleção.')),
  });
}
