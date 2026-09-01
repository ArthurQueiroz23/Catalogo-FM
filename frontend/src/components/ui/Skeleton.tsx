import clsx from 'clsx';

/**
 * Bloco de carregamento. A varredura de luz (`.esqueleto`, em globals.css) comunica "estamos
 * buscando" melhor que um pulso de opacidade e não pisca a tela inteira.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('esqueleto', className)} aria-hidden="true" />;
}
