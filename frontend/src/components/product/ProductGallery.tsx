'use client';

import { ChevronLeft, ChevronRight, ImageOff, PlayCircle, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ImagemProdutoResponse, VideoProdutoResponse } from '@/types/api';

interface ProductGalleryProps {
  nome: string;
  imagens: ImagemProdutoResponse[];
  videos: VideoProdutoResponse[];
}

type ItemGaleria = { tipo: 'imagem'; dados: ImagemProdutoResponse } | { tipo: 'video'; dados: VideoProdutoResponse };

/** Distância mínima, em pixels, para um arraste horizontal contar como "deslizar" e trocar a mídia. */
const DISTANCIA_MINIMA_SWIPE = 40;

export function ProductGallery({ nome, imagens, videos }: ProductGalleryProps) {
  const itens: ItemGaleria[] = [
    ...imagens.map((imagem) => ({ tipo: 'imagem' as const, dados: imagem })),
    ...videos.map((video) => ({ tipo: 'video' as const, dados: video })),
  ];

  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [zoomAberto, setZoomAberto] = useState(false);
  const toqueInicial = useRef<{ x: number; y: number } | null>(null);
  const botaoFecharZoom = useRef<HTMLButtonElement>(null);

  const total = itens.length;

  const irPara = useCallback(
    (passo: number) => {
      setIndiceAtivo((atual) => (atual + passo + total) % total);
    },
    [total]
  );

  // Teclado dentro do zoom: Esc fecha e as setas navegam. Sem isso, quem usa teclado fica preso
  // no modal (só havia o clique no fundo para fechar).
  useEffect(() => {
    if (!zoomAberto) return;

    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setZoomAberto(false);
      if (evento.key === 'ArrowRight') irPara(1);
      if (evento.key === 'ArrowLeft') irPara(-1);
    }

    document.addEventListener('keydown', aoPressionarTecla);
    botaoFecharZoom.current?.focus();
    return () => document.removeEventListener('keydown', aoPressionarTecla);
  }, [zoomAberto, irPara]);

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
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
        <ImageOff className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      <div
        className="group relative aspect-square w-full touch-pan-y overflow-hidden rounded-2xl bg-gray-50"
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
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setZoomAberto(true)}
              aria-label="Ampliar imagem"
              className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </>
        ) : (
          itemAtivo && (
            <video
              src={itemAtivo.dados.url}
              controls
              // playsInline evita que o iOS force a reprodução em tela cheia, tirando a cliente
              // da página do produto. preload="metadata" não baixa o vídeo inteiro sem necessidade.
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          )
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => irPara(-1)}
              aria-label="Mídia anterior"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => irPara(1)}
              aria-label="Próxima mídia"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white">
              {indiceAtivo + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {itens.map((item, index) => (
            <button
              key={`${item.tipo}-${item.dados.id}`}
              type="button"
              onClick={() => setIndiceAtivo(index)}
              aria-label={`Ver ${item.tipo === 'imagem' ? 'foto' : 'vídeo'} ${index + 1} de ${total}`}
              aria-current={index === indiceAtivo}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === indiceAtivo ? 'border-brand-500' : 'border-transparent'
              }`}
            >
              {item.tipo === 'imagem' ? (
                <Image src={item.dados.url} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
                  <PlayCircle className="h-6 w-6" />
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
          aria-label={`${nome} — imagem ampliada`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomAberto(false)}
          onTouchStart={aoIniciarToque}
          onTouchEnd={aoTerminarToque}
        >
          <button
            ref={botaoFecharZoom}
            type="button"
            onClick={() => setZoomAberto(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-full w-full max-w-3xl">
            <Image src={itemAtivo.dados.url} alt={nome} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
