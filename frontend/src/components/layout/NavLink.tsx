'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

/**
 * Link do menu principal que sabe se a página aberta é a dele.
 *
 * Marcar a seção atual é o mínimo para a cliente saber onde está — antes todos os links do
 * cabeçalho tinham exatamente a mesma aparência em qualquer página. O destaque é um sublinhado
 * coral (e `aria-current`), não um preenchimento: preenchimento aqui competiria com os botões
 * de ação, que são os únicos elementos coral cheios do site.
 */
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const ativo = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={ativo ? 'page' : undefined}
      className={clsx(
        'relative inline-flex min-h-11 items-center rounded-pilula px-3.5 text-[0.9375rem]',
        'font-bold transition-colors duration-200 foco-marca',
        'after:absolute after:inset-x-3.5 after:bottom-1.5 after:h-0.5 after:rounded-pilula',
        'after:transition-transform after:duration-300 after:ease-marca after:content-[""]',
        ativo
          ? 'text-coral-800 after:scale-x-100 after:bg-coral-400'
          : 'text-ink-600 hover:text-coral-800 after:scale-x-0 after:bg-coral-300 hover:after:scale-x-100'
      )}
    >
      {children}
    </Link>
  );
}
