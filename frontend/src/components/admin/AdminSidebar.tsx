'use client';

import { LogOut, Package, Ruler, Tags, Shirt, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useLogout } from '@/hooks/useAuth';
import { obterUsuario } from '@/lib/auth';

const LINKS = [
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
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
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onFechar} aria-hidden="true" />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform lg:static lg:translate-x-0',
          aberta ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="text-lg font-bold text-brand-600">Fruto da Malha</p>
            <p className="text-xs text-gray-400">Painel administrativo</p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu"
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden"
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
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  ativo ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          {usuario && <p className="mb-2 truncate text-xs text-gray-400">{usuario.nome}</p>}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
