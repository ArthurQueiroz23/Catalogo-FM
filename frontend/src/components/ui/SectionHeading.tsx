import Link from 'next/link';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}

export function SectionHeading({ title, subtitle, href, hrefLabel = 'Ver tudo' }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
