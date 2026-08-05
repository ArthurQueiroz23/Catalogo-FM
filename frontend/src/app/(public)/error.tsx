'use client';

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Não foi possível carregar esta página</h1>
      <p className="max-w-md text-gray-600">
        Tivemos um problema ao buscar as informações do catálogo. Verifique sua conexão e tente novamente.
      </p>
      <button type="button" onClick={reset} className="btn-primary">
        Tentar novamente
      </button>
    </div>
  );
}
