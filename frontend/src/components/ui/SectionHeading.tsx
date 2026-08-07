import Link from 'next/link';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}

/**
 * Título de seção no estilo dos divisores de categoria do catálogo impresso ("Macacão curto",
 * "Bodys", "Pijamas"): manuscrito, grande, em coral.
 */
export function SectionHeading({ title, subtitle, href, hrefLabel = 'Ver tudo' }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div>
        <h2 className="titulo-secao">{title}</h2>
        {subtitle && <p className="mt-1 text-[0.9375rem] text-ink-500">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center rounded-pilula text-[0.9375rem] font-semibold text-coral-700 transition-colors hover:text-coral-800 foco-marca"
        >
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
