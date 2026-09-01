import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="divisoria flex items-center justify-between gap-4 pt-5">
      <p className="text-sm font-bold tabular-nums text-ink-500">
        Página {page + 1} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button variant="secondary" size="sm" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
