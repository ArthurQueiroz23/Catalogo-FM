import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as adminApi from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import type { ReordenarItemRequest, TamanhoRequest } from '@/types/api';
import { queryKeys } from './query-keys';

function mensagemErro(erro: unknown, fallback: string): string {
  return erro instanceof ApiError ? erro.message : fallback;
}

export function useTamanhos() {
  return useQuery({
    queryKey: queryKeys.tamanhos,
    queryFn: adminApi.listarTamanhosAdmin,
  });
}

export function useCriarTamanho() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: TamanhoRequest) => adminApi.criarTamanho(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tamanhos });
      toast.success('Tamanho criado com sucesso.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível criar o tamanho.')),
  });
}

export function useAtualizarTamanho(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: TamanhoRequest) => adminApi.atualizarTamanho(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tamanhos });
      toast.success('Tamanho atualizado com sucesso.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível atualizar o tamanho.')),
  });
}

export function useExcluirTamanho() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.excluirTamanho(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tamanhos });
      toast.success('Tamanho excluído.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível excluir o tamanho.')),
  });
}

export function useReordenarTamanhos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itens: ReordenarItemRequest[]) => adminApi.reordenarTamanhos(itens),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tamanhos });
    },
    onError: (erro) => {
      toast.error(mensagemErro(erro, 'Não foi possível salvar a nova ordem.'));
      queryClient.invalidateQueries({ queryKey: queryKeys.tamanhos });
    },
  });
}
