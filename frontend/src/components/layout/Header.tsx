import Link from 'next/link';
import { Suspense } from 'react';
import { CartButton } from '@/components/cart/CartButton';
import { SearchBar } from './SearchBar';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="container flex flex-col gap-3 py-3 md:flex-row md:items-center md:gap-6 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="shrink-0 text-xl font-bold tracking-tight text-brand-600">
            Fruto da Malha
          </Link>
          <div className="md:hidden">
            <CartButton />
          </div>
        </div>

        <div className="flex-1 md:max-w-xl">
          <Suspense fallback={<div className="h-10 rounded-full bg-gray-100" />}>
            <SearchBar />
          </Suspense>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/categoria" className="transition-colors hover:text-brand-600">
            Categorias
          </Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
