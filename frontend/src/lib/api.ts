import type { ApiErrorResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

/** Chave usada para persistir o JWT do admin no localStorage — ver src/lib/auth.ts. */
export const TOKEN_STORAGE_KEY = 'frutodamalha_admin_token';

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
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  /** Quando true, anexa `Authorization: Bearer` com o token do admin logado (ver src/lib/auth.ts). */
  auth?: boolean;
  body?: unknown;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
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
    const token = getStoredToken();
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
    throw new ApiError(response.status, data as ApiErrorResponse | null);
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
