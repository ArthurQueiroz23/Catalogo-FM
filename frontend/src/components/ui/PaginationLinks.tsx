import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface PaginationLinksProps {
  /** Página atual, base 0 (mesma convenção do `PageResponse` do backend). */
  page: number;
  totalPages: number;
  /** Monta a URL de uma página — permite preservar os demais filtros da rota (`q`, etc.). */
  construirHref: (page: number) => string;
}

/**
 * Paginação das listagens públicas. Diferente de `Pagination` (usado no painel, que troca de
 * página por callback em memória), esta versão navega por `<Link>` de verdade: cada página tem
 * URL própria, é renderizada no servidor e pode ser rastreada por buscadores — requisito de SEO
 * do catálogo público.
 */
export function PaginationLinks({ page, totalPages, construirHref }: PaginationLinksProps) {
  if (totalPages <= 1) return null;

  const temAnterior = page > 0;
  const temProxima = page + 1 < totalPages;

  const estiloBase =
    'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors';
  const estiloAtivo = 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50';
  const estiloDesativado = 'cursor-not-allowed border-gray-100 text-gray-300';

  return (
    <nav aria-label="Paginação" className="mt-10 flex items-center justify-between gap-4 border-t border-gray-100 pt-6">
      {temAnterior ? (
        <Link href={construirHref(page - 1)} rel="prev" className={`${estiloBase} ${estiloAtivo}`}>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Link>
      ) : (
        <span aria-hidden="true" className={`${estiloBase} ${estiloDesativado}`}>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </span>
      )}

      <p className="text-sm text-gray-500">
        Página {page + 1} de {totalPages}
      </p>

      {temProxima ? (
        <Link href={construirHref(page + 1)} rel="next" className={`${estiloBase} ${estiloAtivo}`}>
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${estiloBase} ${estiloDesativado}`}>
          Próxima
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
