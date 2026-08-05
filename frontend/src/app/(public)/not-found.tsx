import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Página não encontrada</h1>
      <p className="max-w-md text-gray-600">
        O produto ou a página que você procura não existe mais ou foi removida do catálogo.
      </p>
      <Link href="/" className="btn-primary">
        Voltar para o início
      </Link>
    </div>
  );
}
