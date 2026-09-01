'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

/**
 * Busca do catálogo. O campo tem o mesmo corpo dos demais controles (pílula, 44px, anel de
 * foco coral) e ganha um botão de limpar quando há texto — no celular, apagar caractere a
 * caractere para recomeçar uma busca é um atrito real.
 */
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
      <div className="group relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-coral-500
            transition-colors group-focus-within:text-coral-700"
          aria-hidden="true"
        />
        <input
          id="busca-produtos"
          type="search"
          value={termo}
          onChange={(event) => setTermo(event.target.value)}
          placeholder="Buscar peça ou referência..."
          className="min-h-11 w-full rounded-pilula border border-coral-100 bg-creme-50 py-2 pl-11 pr-11
            text-[0.9375rem] text-ink-800 shadow-suave transition-all duration-200
            placeholder:text-ink-300 hover:border-coral-200 focus:border-coral-300
            focus:outline-none focus:ring-4 focus:ring-coral-100
            [&::-webkit-search-cancel-button]:hidden"
        />
        {termo && (
          <button
            type="button"
            onClick={() => setTermo('')}
            aria-label="Limpar busca"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center
              rounded-pilula text-ink-400 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
