import { Camera } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatarPreco } from '@/lib/format';
import type { ProdutoSummaryResponse } from '@/types/api';

/**
 * Card de peça. Segue o tratamento do catálogo impresso — a foto flutua sobre o creme, sem
 * moldura nem sombra dura — dentro de um bloco de superfície, para a grade ler como uma
 * vitrine organizada em vez de fotos soltas.
 *
 * Três decisões de composição que valem registro:
 *
 * 1. **A foto ocupa 4:5, não um quadrado.** Roupa é objeto vertical; no quadrado, a peça
 *    ficava pequena no meio de duas faixas de creme vazio.
 * 2. **Nada flutua sobre a foto em repouso.** A categoria saiu de cima da imagem e virou
 *    rótulo de apoio: numa grade de 20 peças, 20 pílulas coral competiam com as próprias
 *    roupas. Sobre a foto só aparece o "Ver peça", no hover, onde existe ponteiro.
 * 3. **Peça sem foto tem um estado desenhado**, e não um ícone de erro. Hoje o catálogo está
 *    exatamente assim (as fotos ainda não subiram para o Cloudinary), então este é o estado
 *    que a cliente vê — ele precisa parecer intencional.
 *
 * O card inteiro é um único link. O "Ver peça" é um `<span>` com aparência de botão, e não um
 * botão de verdade: aninhar controle interativo dentro de link produz HTML inválido e cria
 * dois alvos de foco para o mesmo destino, atrapalhando teclado e leitor de tela.
 */
export function ProductCard({ produto }: { produto: ProdutoSummaryResponse }) {
  return (
    <Link
      href={`/produto/${produto.referencia}`}
      className="cartao-interativo group flex h-full flex-col overflow-hidden foco-marca"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-coral-100/70 bg-creme-100">
        {produto.imagemPrincipalUrl ? (
          <Image
            src={produto.imagemPrincipalUrl}
            alt={produto.nome}
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 45vw"
            className="object-contain p-4 transition-transform duration-500 ease-marca group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
            <Camera className="h-7 w-7 text-coral-200" aria-hidden="true" />
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-500">
              Foto em breve
            </span>
          </div>
        )}

        {/* Reforço de ação só onde existe ponteiro: no celular o card inteiro já é o toque. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden justify-center bg-gradient-to-t
            from-ink-900/25 to-transparent pb-4 pt-10 opacity-0 transition-opacity duration-300
            group-hover:opacity-100 sm:flex"
        >
          <span className="rounded-pilula bg-coral-400 px-4 py-2 text-sm font-bold text-ink-900 shadow-peca">
            Ver peça
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {produto.categoriaNome && (
          <p className="truncate text-[0.6875rem] font-extrabold uppercase tracking-[0.12em] text-coral-800">
            {produto.categoriaNome}
          </p>
        )}

        <p className="mt-1 line-clamp-2 font-bold leading-snug text-ink-900 transition-colors group-hover:text-coral-800">
          {produto.nome}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="text-lg font-extrabold tabular-nums text-ink-900">
            {formatarPreco(produto.preco)}
          </p>
          <p className="text-[0.6875rem] font-bold tabular-nums text-ink-500">
            Ref. {produto.referencia}
          </p>
        </div>
      </div>
    </Link>
  );
}
