import { Compass } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-pilula bg-coral-100 text-coral-700
          ring-1 ring-inset ring-coral-200"
        aria-hidden="true"
      >
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="titulo-pagina">Não encontramos esta página</h1>
      <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
        A peça ou a página que você procura não existe mais, ou saiu do catálogo.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Voltar para o início
        </Link>
        <Link href="/produtos" className="btn-secondary">
          Ver o catálogo
        </Link>
      </div>
    </div>
  );
}
