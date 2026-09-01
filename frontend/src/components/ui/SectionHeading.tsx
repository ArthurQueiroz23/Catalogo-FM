import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SectionHeadingProps {
  /** Rótulo curto acima do título (ex.: "Vitrine"). Dá contexto sem alongar o título. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}

/**
 * Título de seção no estilo dos divisores de categoria do catálogo impresso ("Macacão curto",
 * "Bodys", "Pijamas"): manuscrito, grande, em coral. O link opcional à direita é o "ver tudo"
 * da seção e fica alinhado à linha de base do título, não flutuando acima dele.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  hrefLabel = 'Ver tudo',
}: SectionHeadingProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        {eyebrow && <p className="olho mb-1.5">{eyebrow}</p>}
        <h2 className="titulo-secao">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-[0.9375rem] leading-relaxed text-ink-500">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-pilula px-3 text-[0.9375rem]
            font-bold text-coral-800 transition-colors hover:bg-coral-50 hover:text-coral-900 foco-marca"
        >
          {hrefLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-marca group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
