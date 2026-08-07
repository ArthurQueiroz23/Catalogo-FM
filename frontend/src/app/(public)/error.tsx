'use client';

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="titulo-pagina">Não foi possível carregar esta página</h1>
      <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
        Tivemos um problema ao buscar o catálogo. Confira sua conexão e tente de novo.
      </p>
      <button type="button" onClick={reset} className="btn-primary">
        Tentar novamente
      </button>
    </div>
  );
}
