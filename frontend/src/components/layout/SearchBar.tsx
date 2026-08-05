'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [termo, setTermo] = useState(searchParams.get('q') ?? '');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const termoLimpo = termo.trim();
    router.push(termoLimpo ? `/busca?q=${encodeURIComponent(termoLimpo)}` : '/busca');
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <label htmlFor="busca-produtos" className="sr-only">
        Buscar produtos por nome, referência ou categoria
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          id="busca-produtos"
          type="search"
          value={termo}
          onChange={(event) => setTermo(event.target.value)}
          placeholder="Buscar por nome, referência ou categoria..."
          className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm
            text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none
            focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </form>
  );
}
