import { ImageOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatarPreco } from '@/lib/format';
import type { ProdutoSummaryResponse } from '@/types/api';

export function ProductCard({ produto }: { produto: ProdutoSummaryResponse }) {
  return (
    <Link
      href={`/produto/${produto.referencia}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
        {produto.imagemPrincipalUrl ? (
          <Image
            src={produto.imagemPrincipalUrl}
            alt={produto.nome}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {produto.lancamento && (
          <span className="absolute left-2 top-2 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            Lançamento
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs uppercase tracking-wide text-gray-400">{produto.categoriaNome}</p>
        <p className="line-clamp-2 text-sm font-medium text-gray-900">{produto.nome}</p>
        <p className="mt-auto text-xs text-gray-400">Ref. {produto.referencia}</p>
        <p className="text-base font-bold text-brand-600">{formatarPreco(produto.preco)}</p>
      </div>
    </Link>
  );
}
