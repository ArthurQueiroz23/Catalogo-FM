import Link from 'next/link';
import { Suspense } from 'react';
import { CartButton } from '@/components/cart/CartButton';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-coral-100 bg-creme/90 backdrop-blur-md">
      <div className="container flex flex-col gap-2.5 py-2.5 md:flex-row md:items-center md:gap-6 md:py-3">
        <div className="flex items-center justify-between gap-4">
          <Logo />

          {/* No celular a navegação principal vive aqui: fora da home, sem estes links a
              cliente só chegaria às categorias pelo rodapé. */}
          <nav className="flex items-center gap-1 md:hidden">
            <Link
              href="/categoria"
              className="inline-flex min-h-11 items-center rounded-pilula px-3 text-[0.9375rem] font-semibold text-ink-700 transition-colors hover:bg-coral-50 foco-marca"
            >
              Categorias
            </Link>
            <CartButton />
          </nav>
        </div>

        <div className="flex-1 md:max-w-md">
          <Suspense fallback={<div className="h-11 rounded-pilula bg-coral-50" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/categoria"
            className="inline-flex min-h-11 items-center rounded-pilula px-4 text-[0.9375rem] font-semibold text-ink-700 transition-colors hover:bg-coral-50 hover:text-coral-700 foco-marca"
          >
            Categorias
          </Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
