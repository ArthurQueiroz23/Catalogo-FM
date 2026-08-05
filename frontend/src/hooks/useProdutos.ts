import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as adminApi from '@/lib/admin-api';
import type { FiltroProdutosAdmin } from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import type {
  ImagemProdutoRequest,
  ProdutoRequest,
  ReordenarItemRequest,
  StatusProduto,
  VideoProdutoRequest,
} from '@/types/api';
import { queryKeys } from './query-keys';

function mensagemErro(erro: unknown, fallback: string): string {
  return erro instanceof ApiError ? erro.message : fallback;
}

export function useProdutosAdmin(filtro: FiltroProdutosAdmin) {
  return useQuery({
    queryKey: queryKeys.produtos(filtro),
    queryFn: () => adminApi.listarProdutosAdmin(filtro),
    placeholderData: (dadosAnteriores) => dadosAnteriores,
  });
}

export function useProdutoAdmin(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.produto(id ?? -1),
    queryFn: () => adminApi.buscarProdutoAdmin(id as number),
    enabled: id !== undefined,
  });
}

function invalidarListasDeProdutos(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['admin', 'produtos'] });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
}

export function useCriarProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ProdutoRequest) => adminApi.criarProduto(request),
    onSuccess: () => {
      invalidarListasDeProdutos(queryClient);
      toast.success('Produto criado com sucesso.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível criar o produto.')),
  });
}

export function useAtualizarProduto(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ProdutoRequest) => adminApi.atualizarProduto(id, request),
    onSuccess: () => {
      invalidarListasDeProdutos(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.produto(id) });
      toast.success('Produto atualizado com sucesso.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível atualizar o produto.')),
  });
}

export function useExcluirProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.excluirProduto(id),
    onSuccess: () => {
      invalidarListasDeProdutos(queryClient);
      toast.success('Produto excluído.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível excluir o produto.')),
  });
}

export function useAlterarStatusProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusProduto }) =>
      adminApi.alterarStatusProduto(id, { status }),
    onSuccess: (_dados, variaveis) => {
      invalidarListasDeProdutos(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.produto(variaveis.id) });
      toast.success(variaveis.status === 'ATIVO' ? 'Produto ativado.' : 'Produto ocultado.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível alterar o status do produto.')),
  });
}

export function useDuplicarProduto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.duplicarProduto(id),
    onSuccess: () => {
      invalidarListasDeProdutos(queryClient);
      toast.success('Produto duplicado. Edite a cópia para adicionar fotos e ativá-la.');
    },
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível duplicar o produto.')),
  });
}

export function useReordenarProdutos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itens: ReordenarItemRequest[]) => adminApi.reordenarProdutos(itens),
    onSuccess: () => invalidarListasDeProdutos(queryClient),
    onError: (erro) => {
      toast.error(mensagemErro(erro, 'Não foi possível salvar a nova ordem.'));
      invalidarListasDeProdutos(queryClient);
    },
  });
}

// ---- Galeria --------------------------------------------------------------------------------

export function useAdicionarImagemProduto(produtoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ImagemProdutoRequest) => adminApi.adicionarImagemProduto(produtoId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.produto(produtoId) }),
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível adicionar a imagem.')),
  });
}

export function useRemoverImagemProduto(produtoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imagemId: number) => adminApi.removerImagemProduto(produtoId, imagemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.produto(produtoId) }),
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível remover a imagem.')),
  });
}

export function useMarcarImagemPrincipal(produtoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imagemId: number) => adminApi.marcarImagemPrincipal(produtoId, imagemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.produto(produtoId) }),
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível marcar a imagem como principal.')),
  });
}

export function useReordenarImagensProduto(produtoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itens: ReordenarItemRequest[]) => adminApi.reordenarImagensProduto(produtoId, itens),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.produto(produtoId) }),
    onError: (erro) => {
      toast.error(mensagemErro(erro, 'Não foi possível reordenar a galeria.'));
      queryClient.invalidateQueries({ queryKey: queryKeys.produto(produtoId) });
    },
  });
}

export function useAdicionarVideoProduto(produtoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: VideoProdutoRequest) => adminApi.adicionarVideoProduto(produtoId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.produto(produtoId) }),
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível adicionar o vídeo.')),
  });
}

export function useRemoverVideoProduto(produtoId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: number) => adminApi.removerVideoProduto(produtoId, videoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.produto(produtoId) }),
    onError: (erro) => toast.error(mensagemErro(erro, 'Não foi possível remover o vídeo.')),
  });
}
