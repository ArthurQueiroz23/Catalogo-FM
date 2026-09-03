import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { Button } from './Button';

export interface ErrorStateProps {
  /** Erro devolvido pelo React Query — usado para exibir a mensagem exata da API quando houver. */
  error: unknown;
  /** O que a tela tentava carregar, em minúsculas (ex.: "as categorias"). */
  recurso: string;
  onRetry?: () => void;
}

/**
 * Estado de falha de carregamento. Existe porque o painel tratava "não consegui carregar" e
 * "não há nada cadastrado" com a mesma tela: uma sessão expirada devolvia 401, a lista chegava
 * indefinida e o painel convidava a "criar a primeira categoria" sobre um catálogo cheio.
 *
 * Visualmente é o oposto do {@link EmptyState}: moldura sólida de alerta, não a tracejada que
 * diz "aqui caberia conteúdo", e a ação é tentar de novo — nunca criar algo novo.
 */
export function ErrorState({ error, recurso, onRetry }: ErrorStateProps) {
  const detalhe = error instanceof ApiError ? error.message : null;

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-peca border border-coral-300 bg-coral-50 px-6 py-16 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-pilula bg-coral-100 text-coral-700 ring-1 ring-inset ring-coral-300">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="titulo-bloco">Não foi possível carregar {recurso}</p>
      <p className="max-w-sm text-[0.9375rem] leading-relaxed text-ink-500">
        {detalhe ?? 'Verifique sua conexão e tente novamente.'} Os dados continuam salvos — isto é
        uma falha de carregamento, não um catálogo vazio.
      </p>
      {onRetry && (
        <div className="mt-2">
          <Button onClick={onRetry} variant="secondary">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
