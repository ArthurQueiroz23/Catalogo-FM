import clsx from 'clsx';

export type BadgeTone = 'green' | 'gray' | 'coral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-verde-50 text-verde-700 ring-verde-100',
  gray: 'bg-creme-200 text-ink-500 ring-creme-300',
  coral: 'bg-coral-50 text-coral-800 ring-coral-100',
};

const DOT_CLASSES: Record<BadgeTone, string> = {
  green: 'bg-verde-600',
  gray: 'bg-ink-300',
  coral: 'bg-coral-400',
};

/**
 * Etiqueta de estado (ativo/oculto, ativa/inativa). O ponto colorido à esquerda faz o estado
 * ser lido de relance numa lista longa — sem ele, duas etiquetas de mesmo tamanho e cor
 * parecida exigiam ler a palavra linha por linha.
 */
export function Badge({
  tone = 'gray',
  dot = true,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-pilula px-2.5 py-1 text-xs font-extrabold',
        'ring-1 ring-inset',
        TONE_CLASSES[tone]
      )}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-pilula', DOT_CLASSES[tone])} aria-hidden="true" />}
      {children}
    </span>
  );
}
