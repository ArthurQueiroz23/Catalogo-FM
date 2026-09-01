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
 *
 * **Não exibe contagem de peças de propósito.** `totalProdutos` conta também as peças ocultas
 * (hoje 75 cadastradas contra 69 publicadas), então o número apareceria errado para a cliente
 * — sem nenhum sinal de que está errado. No painel, onde o total inclui o que está oculto por
 * definição, ele continua sendo exibido.
 */
export function CategoryCard({ categoria }: { categoria: CategoriaResponse }) {
  return (
    <Link
      href={`/categoria/${categoria.slug}`}
      className="group flex flex-col items-center gap-3 rounded-peca p-1 text-center foco-marca"
    >
      <div
        className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center overflow-hidden rounded-pilula
          bg-coral-50 shadow-suave ring-1 ring-coral-200 transition-all duration-300 ease-marca
          group-hover:-translate-y-1 group-hover:bg-coral-100 group-hover:shadow-peca
          group-hover:ring-coral-300 sm:h-24 sm:w-24"
      >
        {categoria.imagemUrl ? (
          <Image
            src={categoria.imagemUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 ease-marca group-hover:scale-105"
          />
        ) : (
          <Shirt className="h-7 w-7 text-coral-500 sm:h-8 sm:w-8" aria-hidden="true" />
        )}
      </div>

      <span className="text-[0.8125rem] font-bold leading-snug text-ink-700 transition-colors group-hover:text-coral-800 sm:text-sm">
        {categoria.nome}
      </span>
    </Link>
  );
}
