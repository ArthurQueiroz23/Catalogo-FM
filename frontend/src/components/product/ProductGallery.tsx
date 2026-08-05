'use client';

import { ImageOff, PlayCircle, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { ImagemProdutoResponse, VideoProdutoResponse } from '@/types/api';

interface ProductGalleryProps {
  nome: string;
  imagens: ImagemProdutoResponse[];
  videos: VideoProdutoResponse[];
}

type ItemGaleria = { tipo: 'imagem'; dados: ImagemProdutoResponse } | { tipo: 'video'; dados: VideoProdutoResponse };

export function ProductGallery({ nome, imagens, videos }: ProductGalleryProps) {
  const itens: ItemGaleria[] = [
    ...imagens.map((imagem) => ({ tipo: 'imagem' as const, dados: imagem })),
    ...videos.map((video) => ({ tipo: 'video' as const, dados: video })),
  ];

  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [zoomAberto, setZoomAberto] = useState(false);

  const itemAtivo = itens[indiceAtivo];

  if (itens.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
        <ImageOff className="h-16 w-16" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50">
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
            <video src={itemAtivo.dados.url} controls className="h-full w-full object-cover" />
          )
        )}
      </div>

      {itens.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {itens.map((item, index) => (
            <button
              key={`${item.tipo}-${item.dados.id}`}
              type="button"
              onClick={() => setIndiceAtivo(index)}
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
        >
          <button
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
