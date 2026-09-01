'use client';

import { CloudOff, RotateCcw } from 'lucide-react';

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-pilula bg-coral-100 text-coral-700
          ring-1 ring-inset ring-coral-200"
        aria-hidden="true"
      >
        <CloudOff className="h-7 w-7" />
      </span>
      <h1 className="titulo-pagina">Não foi possível carregar esta página</h1>
      <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
        Tivemos um problema ao buscar o catálogo. Confira sua conexão e tente de novo.
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-2">
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Tentar novamente
      </button>
    </div>
  );
}
