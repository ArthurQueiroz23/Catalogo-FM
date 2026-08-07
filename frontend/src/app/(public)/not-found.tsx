import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="titulo-pagina">Não encontramos esta página</h1>
      <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-500">
        A peça ou a página que você procura não existe mais, ou saiu do catálogo.
      </p>
      <Link href="/" className="btn-primary">
        Voltar para o início
      </Link>
    </div>
  );
}
