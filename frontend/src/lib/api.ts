import { limparSessao, obterToken } from '@/lib/auth';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Endereço da API, resolvido uma única vez na carga do módulo.
 *
 * O fallback para localhost existe só para desenvolvimento. Em build de produção a variável
 * ausente **derruba o build de propósito**: sem isso, um deploy mal configurado sobe "com
 * sucesso" e aponta para `localhost` — o site parece no ar, mas todo carregamento de produto
 * falha no navegador da cliente, e o erro só aparece bem longe da causa.
 *
 * Lembre que `NEXT_PUBLIC_*` é embutida no bundle durante o build: trocar o valor no painel da
 * hospedagem exige um novo deploy, não basta salvar a variável.
 */
function resolverApiUrl(): string {
  const configurada = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configurada) {
    return configurada.replace(/\/$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL não foi configurada. Defina a URL pública do backend incluindo o ' +
        'sufixo /api/v1 (ex.: https://catalogo-fm.up.railway.app/api/v1) nas variáveis de ' +
        'ambiente do projeto e refaça o deploy. Localmente, preencha frontend/.env.local.',
    );
  }

  return 'http://localhost:8080/api/v1';
}

const API_URL = resolverApiUrl();

const ROTA_LOGIN = '/admin/login';

/**
 * Erro tipado lançado por {@link apiFetch} para respostas não-2xx, carregando o corpo original
 * (`ApiErrorResponse`, ver docs/API_CONTRACT.md) para que a UI possa exibir a mensagem exata
 * devolvida pelo backend em vez de um erro genérico.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorResponse | null;

  constructor(status: number, body: ApiErrorResponse | null) {
    super(body?.mensagem ?? `Erro ao comunicar com a API (status ${status})`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  /**
   * Resposta que significa "esta sessão não vale mais": token ausente, expirado ou de um
   * usuário sem permissão. Como o painel só é usado por administradoras autenticadas, tanto
   * 401 quanto 403 numa chamada com `auth` querem dizer a mesma coisa na prática — é hora de
   * entrar de novo, e não "não existem dados".
   */
  get sessaoInvalida(): boolean {
    return this.status === 401 || this.status === 403;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  /** Quando true, anexa `Authorization: Bearer` com o token do admin logado (ver src/lib/auth.ts). */
  auth?: boolean;
  body?: unknown;
}

/**
 * Sessão recusada pelo backend: descarta o token morto e devolve a administradora ao login.
 *
 * Sem isso, o painel continuava aberto com um token vencido e cada tela recebia 401 — o que as
 * listas exibiam como "nenhum dado cadastrado", enquanto o catálogo público (que não usa token)
 * seguia mostrando tudo. O `replace` evita que o botão "voltar" traga de volta a tela quebrada.
 */
function encerrarSessao(): void {
  if (typeof window === 'undefined') return;

  limparSessao();

  if (!window.location.pathname.startsWith(ROTA_LOGIN)) {
    window.location.replace(ROTA_LOGIN);
  }
}

/**
 * Wrapper único de acesso à API — usado tanto em Server Components (páginas públicas, sem
 * `auth`) quanto em Client Components do painel (`auth: true`). Centraliza serialização JSON,
 * anexação do JWT e o formato de erro, para que nenhuma tela precise reimplementar isso.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth, headers, body, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (auth) {
    const token = obterToken();
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json') ?? false;
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const erro = new ApiError(response.status, data as ApiErrorResponse | null);
    if (auth && erro.sessaoInvalida) {
      encerrarSessao();
    }
    throw erro;
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: ApiFetchOptions) => apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: ApiFetchOptions) => apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
