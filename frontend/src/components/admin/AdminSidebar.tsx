'use client';

import { LogOut, Package, Ruler, Tags, Shirt, Store, X } from 'lucide-react';
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

export function AdminSidebar({ aberta, onFechar }: { aberta: boolean; onFechar: () => void }) {
  const pathname = usePathname();
  const logout = useLogout();
  const usuario = obterUsuario();

  return (
    <>
      {aberta && (
        <div className="fixed inset-0 z-30 bg-ink-900/25 lg:hidden" onClick={onFechar} aria-hidden="true" />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-coral-100 bg-creme',
          'transition-transform lg:static lg:w-64 lg:translate-x-0',
          aberta ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-start justify-between gap-2 px-5 py-5">
          <Logo tamanho="sm" href="/admin/produtos" />
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pilula text-ink-400 hover:bg-coral-50 lg:hidden foco-marca"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {LINKS.map((link) => {
            const ativo = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onFechar}
                aria-current={ativo ? 'page' : undefined}
                className={clsx(
                  'flex min-h-11 items-center gap-3 rounded-pilula px-4 text-[0.9375rem] font-semibold transition-colors foco-marca',
                  ativo ? 'bg-coral-400 text-ink-900' : 'text-ink-600 hover:bg-coral-50 hover:text-coral-800'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-coral-100 p-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-3 rounded-pilula px-4 text-[0.9375rem] font-semibold text-ink-600 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
          >
            <Store className="h-4 w-4 shrink-0" />
            Ver o catálogo
          </Link>
          {usuario && <p className="truncate px-4 pt-2 text-sm text-ink-400">{usuario.nome}</p>}
          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 w-full items-center gap-3 rounded-pilula px-4 text-[0.9375rem] font-semibold text-ink-600 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
