import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface Migalha {
  rotulo: string;
  href?: string;
}

/**
 * Trilha de navegação ("você está aqui"). Existe uma só, usada na peça e na categoria — antes
 * a página do produto tinha a sua própria, escrita à mão com barras `/`, e a categoria não
 * tinha nenhuma: quem entrava por um link do WhatsApp caía numa lista sem saber de onde ela
 * vinha nem como subir um nível.
 */
export function Breadcrumbs({ itens }: { itens: Migalha[] }) {
  return (
    <nav aria-label="Você está aqui" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[0.8125rem] font-semibold text-ink-500">
        {itens.map((item, indice) => {
          const ultimo = indice === itens.length - 1;
          return (
            <li key={`${item.rotulo}-${indice}`} className="flex items-center gap-1">
              {item.href && !ultimo ? (
                <Link
                  href={item.href}
                  className="rounded-pilula px-1 py-0.5 transition-colors hover:text-coral-800 foco-marca"
                >
                  {item.rotulo}
                </Link>
              ) : (
                <span className={ultimo ? 'px-1 py-0.5 text-ink-700' : 'px-1 py-0.5'} aria-current={ultimo ? 'page' : undefined}>
                  {item.rotulo}
                </span>
              )}
              {!ultimo && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-coral-300" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
