'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProdutoSummaryResponse } from '@/types/api';
import { ProductCard } from './ProductCard';

/**
 * Carrossel dos produtos em destaque.
 *
 * É um trilho com rolagem nativa e `scroll-snap`, não um slider controlado por JavaScript: no
 * celular — de onde vem a maior parte das clientes — arrastar com o dedo é o gesto esperado, e
 * a rolagem nativa dá isso de graça, com inércia correta e sem travar a página. As setas e os
 * indicadores são um atalho a mais para o desktop, onde não existe gesto de arrastar.
 *
 * Consequência importante: mesmo se o JavaScript falhar, as peças continuam acessíveis por
 * toque, trackpad e teclado — o trilho é um elemento rolável comum.
 */
export function ProductCarousel({ produtos }: { produtos: ProdutoSummaryResponse[] }) {
  const trilhoRef = useRef<HTMLUListElement>(null);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const medir = useCallback(() => {
    const trilho = trilhoRef.current;
    if (!trilho || trilho.clientWidth === 0) return;

    // A tolerância de 2px absorve o arredondamento subpixel do layout: sem ela, um trilho que
    // cabe inteiro na tela às vezes reporta uma página fantasma a mais.
    const paginas = Math.max(1, Math.ceil((trilho.scrollWidth - 2) / trilho.clientWidth));
    setTotalPaginas(paginas);
    setPagina(Math.min(paginas - 1, Math.round(trilho.scrollLeft / trilho.clientWidth)));
  }, []);

  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(trilho);
    return () => observador.disconnect();
  }, [medir, produtos.length]);

  function irPara(destino: number) {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    const alvo = Math.max(0, Math.min(totalPaginas - 1, destino));
    // `scrollTo` com `smooth` ignora a preferência do sistema (o CSS de `prefers-reduced-motion`
    // só alcança `scroll-behavior`), então a checagem é feita aqui na mão.
    const semMovimento =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    trilho.scrollTo({ left: alvo * trilho.clientWidth, behavior: semMovimento ? 'auto' : 'smooth' });
  }

  if (produtos.length === 0) return null;

  const temNavegacao = totalPaginas > 1;

  // As setas flutuam sobre as bordas do trilho em vez de ocupar espaço ao lado dele: se
  // ocupassem, os cards de destaque começariam alguns pixels adiante dos cards da grade logo
  // abaixo, e a página inteira perderia o prumo da coluna. Escondidas no celular, onde arrastar
  // com o dedo é o gesto natural e a seta só roubaria área da foto.
  const estiloSeta =
    'absolute top-[30%] z-10 hidden h-10 w-10 items-center justify-center rounded-pilula ' +
    'border-2 border-coral-200 bg-creme-50/95 text-ink-700 shadow-peca backdrop-blur-sm ' +
    'transition-colors hover:border-coral-300 hover:bg-coral-50 disabled:cursor-not-allowed ' +
    'disabled:border-coral-100/60 disabled:text-ink-300 disabled:hover:bg-creme-50/95 ' +
    'foco-marca sm:inline-flex';

  return (
    <div className="relative">
      <ul
        ref={trilhoRef}
        onScroll={medir}
        // As margens negativas com o padding dos itens formam a calha entre os cards sem usar
        // `gap`: assim `w-1/2` continua valendo exatamente meia tela, e cada página do snap
        // fecha certinho na borda de um card.
        className="-mx-2 flex snap-x snap-mandatory overflow-x-auto rolagem-invisivel pb-1"
      >
        {produtos.map((produto) => (
          <li key={produto.id} className="w-1/2 shrink-0 snap-start px-2 sm:w-1/3 lg:w-1/4 xl:w-1/5">
            <ProductCard produto={produto} />
          </li>
        ))}
      </ul>

      {temNavegacao && (
        <>
          <button
            type="button"
            onClick={() => irPara(pagina - 1)}
            disabled={pagina === 0}
            aria-label="Ver peças anteriores"
            className={`${estiloSeta} left-0`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => irPara(pagina + 1)}
            disabled={pagina >= totalPaginas - 1}
            aria-label="Ver próximas peças"
            className={`${estiloSeta} right-0`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: totalPaginas }, (_, indice) => (
              <button
                key={indice}
                type="button"
                onClick={() => irPara(indice)}
                aria-label={`Ir para o grupo ${indice + 1} de ${totalPaginas}`}
                aria-current={indice === pagina ? 'true' : undefined}
                className={`h-2.5 rounded-pilula transition-all foco-marca ${
                  indice === pagina ? 'w-6 bg-coral-500' : 'w-2.5 bg-coral-200 hover:bg-coral-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
