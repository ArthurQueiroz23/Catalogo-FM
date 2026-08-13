import { Shirt } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CategoriaResponse } from '@/types/api';

/**
 * Atalho circular de categoria — o equivalente na web aos divisores do catálogo impresso
 * ("Macacão curto", "Bodys", "Pijamas"), que separam os blocos de peças.
 *
 * O círculo é preenchido com o coral da marca para funcionar como alvo de toque visível mesmo
 * sem imagem cadastrada: categoria recém-criada mostra o ícone de peça em vez de um buraco
 * vazio na fileira.
 */
export function CategoryCard({ categoria }: { categoria: CategoriaResponse }) {
  return (
    <Link
      href={`/categoria/${categoria.slug}`}
      className="group flex flex-col items-center gap-2.5 rounded-peca p-2 text-center foco-marca"
    >
      <div
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-pilula
          bg-coral-100 ring-2 ring-inset ring-coral-200 transition-all duration-300
          group-hover:-translate-y-0.5 group-hover:bg-coral-200 group-hover:ring-coral-400
          group-hover:shadow-peca sm:h-24 sm:w-24"
      >
        {categoria.imagemUrl ? (
          <Image src={categoria.imagemUrl} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <Shirt className="h-8 w-8 text-coral-600" aria-hidden="true" />
        )}
      </div>

      <span className="text-sm font-semibold leading-snug text-ink-700 transition-colors group-hover:text-coral-700">
        {categoria.nome}
      </span>
    </Link>
  );
}
