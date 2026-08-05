/**
 * Tipos espelhando os DTOs de resposta/requisição do backend (Spring Boot).
 * Fonte da verdade do contrato: docs/API_CONTRACT.md — qualquer mudança de DTO no backend
 * precisa ser refletida aqui na mesma sessão de trabalho (ver docs/ARCHITECTURE.md §3.4).
 */

export type Sexo = 'MENINO' | 'MENINA' | 'UNISSEX';

export type StatusProduto = 'ATIVO' | 'INATIVO';

// ---- Categorias / Coleções / Tamanhos --------------------------------------------------

export interface CategoriaResponse {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  imagemUrl: string | null;
  ordem: number;
  ativo: boolean;
  totalProdutos: number;
}

export interface ColecaoResponse {
  id: number;
  nome: string;
  slug: string;
  descricao: string | null;
  ativo: boolean;
  totalProdutos: number;
}

export interface TamanhoResponse {
  id: number;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export interface CategoriaRequest {
  nome: string;
  descricao?: string | null;
  imagemUrl?: string | null;
  ativo?: boolean;
}

export interface ColecaoRequest {
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
}

export interface TamanhoRequest {
  nome: string;
  ativo?: boolean;
}

/** Item de uma lista de reordenação (drag-and-drop) — ver docs/API_CONTRACT.md. */
export interface ReordenarItemRequest {
  id: number;
  ordem: number;
}

export interface CategoriaResumo {
  id: number;
  nome: string;
  slug: string;
}

export interface ColecaoResumo {
  id: number;
  nome: string;
  slug: string;
}

export interface TamanhoResumo {
  id: number;
  nome: string;
}

// ---- Produtos ---------------------------------------------------------------------------

export interface ImagemProdutoResponse {
  id: number;
  url: string;
  principal: boolean;
  ordem: number;
}

export interface VideoProdutoResponse {
  id: number;
  url: string;
  ordem: number;
}

export interface ProdutoResponse {
  id: number;
  nome: string;
  referencia: string;
  descricao: string | null;
  preco: number;
  categoria: CategoriaResumo;
  colecao: ColecaoResumo | null;
  tecido: string | null;
  sexo: Sexo;
  status: StatusProduto;
  observacoes: string | null;
  destaque: boolean;
  lancamento: boolean;
  tamanhosDisponiveis: TamanhoResumo[];
  imagens: ImagemProdutoResponse[];
  videos: VideoProdutoResponse[];
}

export interface ProdutoRequest {
  nome: string;
  referencia: string;
  descricao?: string | null;
  preco: number;
  categoriaId: number;
  colecaoId?: number | null;
  tecido?: string | null;
  sexo: Sexo;
  status?: StatusProduto;
  observacoes?: string | null;
  destaque: boolean;
  lancamento: boolean;
  tamanhoIds: number[];
}

export interface AlterarStatusProdutoRequest {
  status: StatusProduto;
}

export interface ImagemProdutoRequest {
  url: string;
  publicId: string;
}

export interface VideoProdutoRequest {
  url: string;
  publicId: string;
}

export interface ProdutoSummaryResponse {
  id: number;
  nome: string;
  referencia: string;
  preco: number;
  categoriaNome: string;
  imagemPrincipalUrl: string | null;
  status: StatusProduto;
  destaque: boolean;
  lancamento: boolean;
}

// ---- Autenticação -------------------------------------------------------------------------

export interface UsuarioResponse {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEm: number;
  usuario: UsuarioResponse;
}

// ---- Upload (Cloudinary) ------------------------------------------------------------------

export type CloudinaryResourceType = 'image' | 'video';

export interface UploadSignatureRequest {
  resourceType: CloudinaryResourceType;
  folder: string;
}

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

// ---- Dashboard ----------------------------------------------------------------------------

export interface DashboardResponse {
  totalProdutos: number;
  totalProdutosAtivos: number;
  totalProdutosOcultos: number;
  totalCategorias: number;
  totalColecoes: number;
  produtosRecentes: ProdutoSummaryResponse[];
}

// ---- Envelopes comuns -----------------------------------------------------------------------

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiFieldError {
  campo: string;
  mensagem: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  path: string;
  campos?: ApiFieldError[];
}
