import type { LoginResponse, UsuarioResponse } from '@/types/api';
import { TOKEN_STORAGE_KEY } from './api';

const USUARIO_STORAGE_KEY = 'frutodamalha_admin_usuario';

/**
 * Sessão do admin persistida em localStorage (JWT stateless — ver docs/ARCHITECTURE.md §2.7 e
 * §3.2). Funções simples em vez de um store reativo por ora: a tela de login e o layout
 * protegido do painel (`/admin/**`) ainda serão implementados na próxima sessão de trabalho, e
 * é nesse momento que decidimos se compensa envolver isso num store — ver docs/PROGRESS.md.
 */

export function salvarSessao(login: LoginResponse): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, login.token);
  window.localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(login.usuario));
}

export function limparSessao(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USUARIO_STORAGE_KEY);
}

export function obterToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function obterUsuario(): UsuarioResponse | null {
  if (typeof window === 'undefined') return null;
  const bruto = window.localStorage.getItem(USUARIO_STORAGE_KEY);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as UsuarioResponse;
  } catch {
    return null;
  }
}

export function estaAutenticado(): boolean {
  return obterToken() !== null;
}
