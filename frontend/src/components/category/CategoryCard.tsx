import { Shirt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoriaResponse } from '@/types/api';

export function CategoryCard({ categoria }: { categoria: CategoriaResponse }) {
  return (
    <Link
      href={`/categoria/${categoria.slug}`}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-50 ring-1 ring-inset ring-brand-100 transition-transform group-hover:scale-105 sm:h-24 sm:w-24">
        {categoria.imagemUrl ? (
          <Image src={categoria.imagemUrl} alt={categoria.nome} fill sizes="96px" className="object-cover" />
        ) : (
          <Shirt className="h-8 w-8 text-brand-400" />
        )}
      </div>
      <span className="text-xs font-medium text-gray-700 sm:text-sm">{categoria.nome}</span>
    </Link>
  );
}
