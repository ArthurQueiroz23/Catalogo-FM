import { ImageOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatarPreco } from '@/lib/format';
import type { ProdutoSummaryResponse } from '@/types/api';

/**
 * Card de peça. Segue o tratamento do catálogo impresso: a foto flutua sobre o creme, sem
 * moldura nem sombra dura, e os dados vêm abaixo na mesma ordem das páginas do PDF
 * (referência → nome → preço). O véu creme por trás da foto é quase invisível quando a imagem
 * tem fundo removido, e serve de rede de segurança para fotos que ainda têm fundo próprio.
 */
export function ProductCard({ produto }: { produto: ProdutoSummaryResponse }) {
  return (
    <Link
      href={`/produto/${produto.referencia}`}
      className="group flex flex-col rounded-peca p-2 transition-colors hover:bg-creme-50/70 foco-marca"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-peca bg-creme-50/60">
        {produto.imagemPrincipalUrl ? (
          <Image
            src={produto.imagemPrincipalUrl}
            alt={produto.nome}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-coral-200">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-1 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-coral-600">
          Ref. {produto.referencia}
        </p>
        <p className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-ink-800">
          {produto.nome}
        </p>
        <p className="mt-auto pt-1.5 text-lg font-bold text-ink-900">{formatarPreco(produto.preco)}</p>
      </div>
    </Link>
  );
}
