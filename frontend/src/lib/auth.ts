import type { LoginResponse, UsuarioResponse } from '@/types/api';

/** Chave usada para persistir o JWT do admin no localStorage. */
export const TOKEN_STORAGE_KEY = 'frutodamalha_admin_token';

const USUARIO_STORAGE_KEY = 'frutodamalha_admin_usuario';

/**
 * Margem de segurança na checagem de validade: um token que vence nos próximos segundos já é
 * tratado como vencido. Evita o caso em que a tela passa no guard e a requisição disparada logo
 * depois chega ao backend com o token já expirado — o painel abriria só para falhar em seguida.
 */
const MARGEM_EXPIRACAO_MS = 30_000;

/**
 * Sessão do admin persistida em localStorage (JWT stateless — ver docs/ARCHITECTURE.md §2.7 e
 * §3.2). Como o token tem validade fixa (`APP_JWT_EXPIRATION_MS`, 24h por padrão) e nada o
 * renova, "ter um token guardado" **não** é o mesmo que "estar autenticada": expirado, ele
 * continua no localStorage e o backend responde 401 a cada chamada do painel. Por isso a leitura
 * do token valida `exp` e descarta a sessão vencida — sem isso o painel abria normalmente e
 * todas as listas voltavam vazias, dando a impressão de um catálogo sem dados.
 */

export function salvarSessao(login: LoginResponse): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, login.token);
  window.localStorage.setItem(USUARIO_STORAGE_KEY, JSON.stringify(login.usuario));
}

export function limparSessao(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USUARIO_STORAGE_KEY);
}

/**
 * Lê o `exp` (segundos desde a época, padrão JWT) do payload do token. Só inspeciona: a
 * verificação de assinatura é do backend — aqui o objetivo é apenas não mandar o painel abrir
 * com uma sessão que sabidamente já não vale. Token ilegível conta como vencido.
 */
function tokenExpirado(token: string): boolean {
  const payloadBruto = token.split('.')[1];
  if (!payloadBruto) return true;

  try {
    const base64 = payloadBruto.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64)) as { exp?: number };
    if (typeof payload.exp !== 'number') return true;
    return payload.exp * 1000 - MARGEM_EXPIRACAO_MS <= Date.now();
  } catch {
    return true;
  }
}

export function obterToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;

  if (tokenExpirado(token)) {
    limparSessao();
    return null;
  }

  return token;
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
