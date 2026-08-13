import { ImageOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatarPreco } from '@/lib/format';
import type { ProdutoSummaryResponse } from '@/types/api';

/**
 * Card de peça. Segue o tratamento do catálogo impresso — a foto flutua sobre o creme, sem
 * moldura nem sombra dura — mas agora dentro de um bloco de superfície, para a grade ler como
 * uma vitrine organizada em quadrados em vez de fotos soltas.
 *
 * Os dados vêm na mesma ordem das páginas do PDF (referência → nome → preço), e só são exibidos
 * campos que o `ProdutoSummaryResponse` realmente traz: nada de composição ou tecido aqui, que
 * pertencem à ficha completa em `/produto/[referencia]`.
 *
 * O card inteiro é um único link. O "Ver peça" é um `<span>` com aparência de botão, e não um
 * botão de verdade: aninhar controle interativo dentro de link produz HTML inválido e cria dois
 * alvos de foco para o mesmo destino, atrapalhando teclado e leitor de tela.
 */
export function ProductCard({ produto }: { produto: ProdutoSummaryResponse }) {
  return (
    <Link
      href={`/produto/${produto.referencia}`}
      className="group flex h-full flex-col overflow-hidden rounded-peca bg-creme-50/80 shadow-peca
        ring-1 ring-coral-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-flutuante
        hover:ring-coral-200 foco-marca"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-creme-100">
        {produto.imagemPrincipalUrl ? (
          <Image
            src={produto.imagemPrincipalUrl}
            alt={produto.nome}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 45vw"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-coral-200">
            <ImageOff className="h-10 w-10" aria-hidden="true" />
          </div>
        )}

        {/* Pílula da categoria sobre a foto, como nos divisores do catálogo impresso. Fica
            escondida de leitores de tela: a categoria já é anunciada na página da peça, e aqui
            ela repetiria informação no meio do nome do produto. */}
        {produto.categoriaNome && (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-pilula
              bg-coral-400/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-ink-900"
          >
            {produto.categoriaNome}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 p-3 pt-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-coral-700">
          Ref. {produto.referencia}
        </p>
        <p className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-ink-800">
          {produto.nome}
        </p>

        <p className="mt-auto pt-2 text-lg font-bold text-ink-900">{formatarPreco(produto.preco)}</p>

        <span
          aria-hidden="true"
          className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center rounded-pilula
            bg-coral-400 px-3 text-sm font-semibold text-ink-900 transition-colors group-hover:bg-coral-300"
        >
          Ver peça
        </span>
      </div>
    </Link>
  );
}
