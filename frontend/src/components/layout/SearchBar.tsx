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
        Buscar peças por nome, referência ou categoria
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-coral-500" />
        <input
          id="busca-produtos"
          type="search"
          value={termo}
          onChange={(event) => setTermo(event.target.value)}
          placeholder="Buscar uma peça..."
          className="min-h-11 w-full rounded-pilula border-2 border-coral-100 bg-creme-50 py-2 pl-11 pr-4
            text-[0.9375rem] text-ink-800 transition-colors placeholder:text-ink-400
            hover:border-coral-200 focus:border-coral-300 focus:outline-none
            focus:ring-4 focus:ring-coral-100"
        />
      </div>
    </form>
  );
}
