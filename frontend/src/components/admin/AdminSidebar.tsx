'use client';

import { ExternalLink, LogOut, Package, Ruler, Tags, Shirt, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Logo } from '@/components/layout/Logo';
import { useLogout } from '@/hooks/useAuth';
import { obterUsuario } from '@/lib/auth';

const LINKS = [
  { href: '/admin/produtos', label: 'Peças', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
  { href: '/admin/colecoes', label: 'Coleções', icon: Shirt },
  { href: '/admin/tamanhos', label: 'Tamanhos', icon: Ruler },
];

/**
 * Menu do painel. No computador ele é uma coluna fixa de altura inteira (`sticky`), então a
 * navegação continua ao alcance mesmo no fim de uma lista de 200 peças — antes ela rolava
 * junto com a página e sumia. No celular vira uma gaveta sobre um véu escuro.
 */
export function AdminSidebar({ aberta, onFechar }: { aberta: boolean; onFechar: () => void }) {
  const pathname = usePathname();
  const logout = useLogout();
  const usuario = obterUsuario();

  return (
    <>
      {aberta && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/40 backdrop-blur-sm lg:hidden"
          onClick={onFechar}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-coral-100 bg-creme-50',
          'shadow-flutuante transition-transform duration-300 ease-marca',
          'lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:translate-x-0 lg:shadow-none',
          aberta ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-coral-100 px-5 py-4">
          <Logo tamanho="sm" href="/admin/produtos" />
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu"
            className="btn-icone lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="olho px-4 pb-2">Catálogo</p>
          <ul className="space-y-1">
            {LINKS.map((link) => {
              const ativo = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onFechar}
                    aria-current={ativo ? 'page' : undefined}
                    className={clsx(
                      'flex min-h-11 items-center gap-3 rounded-pilula px-4 text-[0.9375rem] font-bold',
                      'transition-all duration-200 foco-marca',
                      ativo
                        ? 'bg-coral-400 text-ink-900 shadow-suave'
                        : 'text-ink-600 hover:bg-coral-50 hover:text-coral-800'
                    )}
                  >
                    <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-coral-100 p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-3 rounded-pilula px-4 text-[0.9375rem] font-bold
              text-ink-600 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
          >
            <ExternalLink className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
            Ver o catálogo
          </Link>

          {usuario && (
            <div className="mt-2 flex items-center gap-3 rounded-2xl bg-creme-100 px-3 py-2.5 ring-1 ring-coral-100">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pilula bg-coral-400
                  text-sm font-extrabold text-ink-900"
                aria-hidden="true"
              >
                {usuario.nome.trim().charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink-800">{usuario.nome}</p>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                  Administradora
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-pilula px-4 text-[0.9375rem]
              font-bold text-ink-600 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
          >
            <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
