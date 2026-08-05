import { api } from '@/lib/api';
import type {
  AlterarStatusProdutoRequest,
  CategoriaRequest,
  CategoriaResponse,
  ColecaoRequest,
  ColecaoResponse,
  DashboardResponse,
  ImagemProdutoRequest,
  LoginRequest,
  LoginResponse,
  PageResponse,
  ProdutoRequest,
  ProdutoResponse,
  ProdutoSummaryResponse,
  ReordenarItemRequest,
  Sexo,
  StatusProduto,
  TamanhoRequest,
  TamanhoResponse,
  UploadSignatureRequest,
  UploadSignatureResponse,
  VideoProdutoRequest,
} from '@/types/api';

/**
 * Funções tipadas de acesso à API administrativa — um wrapper fino por endpoint, todas usando
 * `auth: true` (anexa o JWT). Não conter nenhuma lógica além de montar a chamada: cache,
 * invalidação e estado de carregamento ficam nos hooks React Query em `src/hooks/`.
 * Rotas exatas em docs/API_CONTRACT.md — não duplicar/recriar endpoints aqui, só consumir.
 */

// ---- Autenticação -------------------------------------------------------------------------

export function login(request: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', request);
}

// ---- Categorias ---------------------------------------------------------------------------

export function listarCategoriasAdmin(): Promise<CategoriaResponse[]> {
  return api.get<CategoriaResponse[]>('/admin/categorias', { auth: true });
}

export function buscarCategoria(id: number): Promise<CategoriaResponse> {
  return api.get<CategoriaResponse>(`/admin/categorias/${id}`, { auth: true });
}

export function criarCategoria(request: CategoriaRequest): Promise<CategoriaResponse> {
  return api.post<CategoriaResponse>('/admin/categorias', request, { auth: true });
}

export function atualizarCategoria(id: number, request: CategoriaRequest): Promise<CategoriaResponse> {
  return api.put<CategoriaResponse>(`/admin/categorias/${id}`, request, { auth: true });
}

export function excluirCategoria(id: number): Promise<void> {
  return api.delete<void>(`/admin/categorias/${id}`, { auth: true });
}

export function reordenarCategorias(itens: ReordenarItemRequest[]): Promise<void> {
  return api.patch<void>('/admin/categorias/reordenar', itens, { auth: true });
}

// ---- Coleções -------------------------------------------------------------------------------

export function listarColecoesAdmin(): Promise<ColecaoResponse[]> {
  return api.get<ColecaoResponse[]>('/admin/colecoes', { auth: true });
}

export function buscarColecao(id: number): Promise<ColecaoResponse> {
  return api.get<ColecaoResponse>(`/admin/colecoes/${id}`, { auth: true });
}

export function criarColecao(request: ColecaoRequest): Promise<ColecaoResponse> {
  return api.post<ColecaoResponse>('/admin/colecoes', request, { auth: true });
}

export function atualizarColecao(id: number, request: ColecaoRequest): Promise<ColecaoResponse> {
  return api.put<ColecaoResponse>(`/admin/colecoes/${id}`, request, { auth: true });
}

export function excluirColecao(id: number): Promise<void> {
  return api.delete<void>(`/admin/colecoes/${id}`, { auth: true });
}

// ---- Tamanhos -------------------------------------------------------------------------------

export function listarTamanhosAdmin(): Promise<TamanhoResponse[]> {
  return api.get<TamanhoResponse[]>('/admin/tamanhos', { auth: true });
}

export function criarTamanho(request: TamanhoRequest): Promise<TamanhoResponse> {
  return api.post<TamanhoResponse>('/admin/tamanhos', request, { auth: true });
}

export function atualizarTamanho(id: number, request: TamanhoRequest): Promise<TamanhoResponse> {
  return api.put<TamanhoResponse>(`/admin/tamanhos/${id}`, request, { auth: true });
}

export function excluirTamanho(id: number): Promise<void> {
  return api.delete<void>(`/admin/tamanhos/${id}`, { auth: true });
}

export function reordenarTamanhos(itens: ReordenarItemRequest[]): Promise<void> {
  return api.patch<void>('/admin/tamanhos/reordenar', itens, { auth: true });
}

// ---- Produtos -------------------------------------------------------------------------------

export interface FiltroProdutosAdmin {
  q?: string;
  categoria?: string;
  colecao?: string;
  sexo?: Sexo;
  status?: StatusProduto;
  incluirExcluidos?: boolean;
  page?: number;
  size?: number;
}

function montarQueryProdutosAdmin(filtro: FiltroProdutosAdmin): string {
  const params = new URLSearchParams();
  if (filtro.q) params.set('q', filtro.q);
  if (filtro.categoria) params.set('categoria', filtro.categoria);
  if (filtro.colecao) params.set('colecao', filtro.colecao);
  if (filtro.sexo) params.set('sexo', filtro.sexo);
  if (filtro.status) params.set('status', filtro.status);
  if (filtro.incluirExcluidos) params.set('incluirExcluidos', 'true');
  params.set('page', String(filtro.page ?? 0));
  params.set('size', String(filtro.size ?? 20));
  return params.toString();
}

export function listarProdutosAdmin(filtro: FiltroProdutosAdmin): Promise<PageResponse<ProdutoSummaryResponse>> {
  return api.get<PageResponse<ProdutoSummaryResponse>>(`/admin/produtos?${montarQueryProdutosAdmin(filtro)}`, {
    auth: true,
  });
}

export function buscarProdutoAdmin(id: number): Promise<ProdutoResponse> {
  return api.get<ProdutoResponse>(`/admin/produtos/${id}`, { auth: true });
}

export function criarProduto(request: ProdutoRequest): Promise<ProdutoResponse> {
  return api.post<ProdutoResponse>('/admin/produtos', request, { auth: true });
}

export function atualizarProduto(id: number, request: ProdutoRequest): Promise<ProdutoResponse> {
  return api.put<ProdutoResponse>(`/admin/produtos/${id}`, request, { auth: true });
}

export function excluirProduto(id: number): Promise<void> {
  return api.delete<void>(`/admin/produtos/${id}`, { auth: true });
}

export function alterarStatusProduto(id: number, request: AlterarStatusProdutoRequest): Promise<ProdutoResponse> {
  return api.patch<ProdutoResponse>(`/admin/produtos/${id}/status`, request, { auth: true });
}

export function duplicarProduto(id: number): Promise<ProdutoResponse> {
  return api.post<ProdutoResponse>(`/admin/produtos/${id}/duplicar`, undefined, { auth: true });
}

export function reordenarProdutos(itens: ReordenarItemRequest[]): Promise<void> {
  return api.patch<void>('/admin/produtos/reordenar', itens, { auth: true });
}

export function adicionarImagemProduto(produtoId: number, request: ImagemProdutoRequest): Promise<ProdutoResponse> {
  return api.post<ProdutoResponse>(`/admin/produtos/${produtoId}/imagens`, request, { auth: true });
}

export function removerImagemProduto(produtoId: number, imagemId: number): Promise<void> {
  return api.delete<void>(`/admin/produtos/${produtoId}/imagens/${imagemId}`, { auth: true });
}

export function marcarImagemPrincipal(produtoId: number, imagemId: number): Promise<ProdutoResponse> {
  return api.patch<ProdutoResponse>(`/admin/produtos/${produtoId}/imagens/${imagemId}/principal`, undefined, {
    auth: true,
  });
}

export function reordenarImagensProduto(produtoId: number, itens: ReordenarItemRequest[]): Promise<void> {
  return api.patch<void>(`/admin/produtos/${produtoId}/imagens/reordenar`, itens, { auth: true });
}

export function adicionarVideoProduto(produtoId: number, request: VideoProdutoRequest): Promise<ProdutoResponse> {
  return api.post<ProdutoResponse>(`/admin/produtos/${produtoId}/videos`, request, { auth: true });
}

export function removerVideoProduto(produtoId: number, videoId: number): Promise<void> {
  return api.delete<void>(`/admin/produtos/${produtoId}/videos/${videoId}`, { auth: true });
}

// ---- Upload (Cloudinary) ------------------------------------------------------------------

export function gerarAssinaturaUpload(request: UploadSignatureRequest): Promise<UploadSignatureResponse> {
  return api.post<UploadSignatureResponse>('/admin/uploads/signature', request, { auth: true });
}

// ---- Dashboard ----------------------------------------------------------------------------

export function buscarDashboard(): Promise<DashboardResponse> {
  return api.get<DashboardResponse>('/admin/dashboard', { auth: true });
}
