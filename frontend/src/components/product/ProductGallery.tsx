'use client';

import { ChevronLeft, ChevronRight, ImageOff, Play, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ImagemProdutoResponse, VideoProdutoResponse } from '@/types/api';

interface ProductGalleryProps {
  nome: string;
  imagens: ImagemProdutoResponse[];
  videos: VideoProdutoResponse[];
}

type ItemGaleria = { tipo: 'imagem'; dados: ImagemProdutoResponse } | { tipo: 'video'; dados: VideoProdutoResponse };

/** Distância mínima, em pixels, para um arraste horizontal contar como "deslizar". */
const DISTANCIA_MINIMA_SWIPE = 40;

/**
 * Carrossel de mídia da peça: todas as fotos e vídeos cadastrados, sem limite de quantidade.
 * Desliza com o dedo no celular, tem setas e teclado no computador, e amplia a foto em tela
 * cheia. A ordem é a definida pela administradora no painel (arrastar e soltar).
 */
export function ProductGallery({ nome, imagens, videos }: ProductGalleryProps) {
  const itens: ItemGaleria[] = [
    ...imagens.map((imagem) => ({ tipo: 'imagem' as const, dados: imagem })),
    ...videos.map((video) => ({ tipo: 'video' as const, dados: video })),
  ];

  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [zoomAberto, setZoomAberto] = useState(false);
  const toqueInicial = useRef<{ x: number; y: number } | null>(null);
  const botaoFecharZoom = useRef<HTMLButtonElement>(null);
  const tiras = useRef<HTMLDivElement>(null);

  const total = itens.length;

  const irPara = useCallback(
    (passo: number) => {
      setIndiceAtivo((atual) => (atual + passo + total) % total);
    },
    [total]
  );

  // Teclado dentro do zoom: Esc fecha e as setas navegam. Sem isso, quem usa teclado fica
  // preso no modal (só havia o clique no fundo para fechar).
  useEffect(() => {
    if (!zoomAberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setZoomAberto(false);
      if (evento.key === 'ArrowRight') irPara(1);
      if (evento.key === 'ArrowLeft') irPara(-1);
    }

    document.addEventListener('keydown', aoPressionarTecla);
    document.body.style.overflow = 'hidden';
    botaoFecharZoom.current?.focus();
    return () => {
      document.removeEventListener('keydown', aoPressionarTecla);
      document.body.style.overflow = '';
    };
  }, [zoomAberto, irPara]);

  // Mantém a miniatura ativa sempre visível na tira quando há muitas mídias.
  useEffect(() => {
    tiras.current?.children[indiceAtivo]?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [indiceAtivo]);

  function aoIniciarToque(evento: React.TouchEvent) {
    const toque = evento.touches[0];
    toqueInicial.current = toque ? { x: toque.clientX, y: toque.clientY } : null;
  }

  function aoTerminarToque(evento: React.TouchEvent) {
    const inicio = toqueInicial.current;
    const fim = evento.changedTouches[0];
    toqueInicial.current = null;
    if (!inicio || !fim || total <= 1) return;

    const deltaX = fim.clientX - inicio.x;
    const deltaY = fim.clientY - inicio.y;
    // Só conta como swipe se o movimento for claramente horizontal — do contrário um scroll
    // vertical da página trocaria a foto sem querer.
    if (Math.abs(deltaX) < DISTANCIA_MINIMA_SWIPE || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    irPara(deltaX < 0 ? 1 : -1);
  }

  const itemAtivo = itens[indiceAtivo];

  if (total === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-peca bg-creme-50/60 text-coral-200">
        <ImageOff className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      <div
        className="group relative aspect-square w-full touch-pan-y overflow-hidden rounded-peca bg-creme-50/60"
        onTouchStart={aoIniciarToque}
        onTouchEnd={aoTerminarToque}
      >
        {itemAtivo?.tipo === 'imagem' ? (
          <>
            <Image
              src={itemAtivo.dados.url}
              alt={nome}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-contain p-3"
            />
            <button
              type="button"
              onClick={() => setZoomAberto(true)}
              aria-label="Ampliar foto"
              className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-pilula
                bg-creme/90 text-ink-700 shadow-peca transition-colors hover:bg-creme hover:text-coral-700 foco-marca"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </>
        ) : (
          itemAtivo && (
            <video
              src={itemAtivo.dados.url}
              controls
              // playsInline evita que o iOS force a reprodução em tela cheia, tirando a cliente
              // da página da peça. preload="metadata" não baixa o vídeo inteiro sem necessidade.
              playsInline
              preload="metadata"
              className="h-full w-full rounded-peca object-contain"
            />
          )
        )}

        {total > 1 && (
          <>
            {[
              { passo: -1, Icone: ChevronLeft, rotulo: 'Mídia anterior', pos: 'left-2' },
              { passo: 1, Icone: ChevronRight, rotulo: 'Próxima mídia', pos: 'right-2' },
            ].map(({ passo, Icone, rotulo, pos }) => (
              <button
                key={rotulo}
                type="button"
                onClick={() => irPara(passo)}
                aria-label={rotulo}
                className={`absolute ${pos} top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center
                  rounded-pilula bg-creme/85 text-ink-700 shadow-peca transition-all hover:bg-creme
                  hover:text-coral-700 md:opacity-0 md:group-hover:opacity-100 foco-marca`}
              >
                <Icone className="h-5 w-5" />
              </button>
            ))}
            <span className="absolute bottom-3 left-3 rounded-pilula bg-creme/90 px-3 py-1 text-xs font-bold text-ink-700">
              {indiceAtivo + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div ref={tiras} className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {itens.map((item, index) => (
            <button
              key={`${item.tipo}-${item.dados.id}`}
              type="button"
              onClick={() => setIndiceAtivo(index)}
              aria-label={`Ver ${item.tipo === 'imagem' ? 'foto' : 'vídeo'} ${index + 1} de ${total}`}
              aria-current={index === indiceAtivo}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-creme-50 ring-2 transition-all foco-marca ${
                index === indiceAtivo ? 'ring-coral-400' : 'ring-coral-100 hover:ring-coral-200'
              }`}
            >
              {item.tipo === 'imagem' ? (
                <Image src={item.dados.url} alt="" fill sizes="64px" className="object-contain p-1" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-coral-100 text-coral-700">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {zoomAberto && itemAtivo?.tipo === 'imagem' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${nome} — foto ampliada`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/95 p-4"
          onClick={() => setZoomAberto(false)}
          onTouchStart={aoIniciarToque}
          onTouchEnd={aoTerminarToque}
        >
          <button
            ref={botaoFecharZoom}
            type="button"
            onClick={() => setZoomAberto(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-pilula
              bg-creme/15 text-creme transition-colors hover:bg-creme/25 foco-marca"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-full w-full max-w-4xl">
            <Image src={itemAtivo.dados.url} alt={nome} fill sizes="100vw" className="object-contain" />
          </div>
          {total > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-pilula bg-creme/15 px-3 py-1 text-xs font-bold text-creme">
              {indiceAtivo + 1} / {total}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
