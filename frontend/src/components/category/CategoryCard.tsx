import { Shirt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoriaResponse } from '@/types/api';

export function CategoryCard({ categoria }: { categoria: CategoriaResponse }) {
  return (
    <Link
      href={`/categoria/${categoria.slug}`}
      className="group flex flex-col items-center gap-2.5 rounded-peca p-2 text-center transition-colors hover:bg-creme-50/70 foco-marca"
    >
      <div
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-pilula
          bg-creme-50 ring-2 ring-inset ring-coral-200 transition-all duration-300
          group-hover:ring-coral-400 sm:h-24 sm:w-24"
      >
        {categoria.imagemUrl ? (
          <Image src={categoria.imagemUrl} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <Shirt className="h-8 w-8 text-coral-400" />
        )}
      </div>
      <span className="text-sm font-semibold leading-snug text-ink-700 group-hover:text-coral-700">
        {categoria.nome}
      </span>
    </Link>
  );
}
