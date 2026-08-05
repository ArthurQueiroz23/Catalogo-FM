'use client';

import { Loader2, Plus, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  useAdicionarImagemProduto,
  useAdicionarVideoProduto,
  useMarcarImagemPrincipal,
  useReordenarImagensProduto,
  useRemoverImagemProduto,
  useRemoverVideoProduto,
} from '@/hooks/useProdutos';
import { useUpload } from '@/hooks/useUpload';
import { sanitizarSegmentoPasta } from '@/lib/cloudinary-upload';
import type { ImagemProdutoResponse, VideoProdutoResponse } from '@/types/api';
import { SortableList } from './SortableList';

interface ProductGalleryManagerProps {
  produtoId: number;
  referencia: string;
  imagens: ImagemProdutoResponse[];
  videos: VideoProdutoResponse[];
}

export function ProductGalleryManager({ produtoId, referencia, imagens, videos }: ProductGalleryManagerProps) {
  return (
    <div className="flex flex-col gap-8">
      <GaleriaImagens produtoId={produtoId} referencia={referencia} imagens={imagens} />
      <GaleriaVideos produtoId={produtoId} referencia={referencia} videos={videos} />
    </div>
  );
}

function GaleriaImagens({
  produtoId,
  referencia,
  imagens,
}: {
  produtoId: number;
  referencia: string;
  imagens: ImagemProdutoResponse[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { enviando, progresso, enviarArquivo } = useUpload();
  const adicionarImagem = useAdicionarImagemProduto(produtoId);
  const removerImagem = useRemoverImagemProduto(produtoId);
  const marcarPrincipal = useMarcarImagemPrincipal(produtoId);
  const reordenarImagens = useReordenarImagensProduto(produtoId);
  const [removendoId, setRemovendoId] = useState<number | null>(null);

  async function handleSelecionarArquivos(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (arquivos.length === 0) return;

    for (const arquivo of arquivos) {
      try {
        const resultado = await enviarArquivo(arquivo, 'image', `produtos/${sanitizarSegmentoPasta(referencia)}`);
        if (resultado) {
          await adicionarImagem.mutateAsync({ url: resultado.url, publicId: resultado.publicId });
        }
      } catch (erro) {
        toast.error((erro as Error).message);
      }
    }
  }

  async function handleRemover(imagemId: number) {
    setRemovendoId(imagemId);
    try {
      await removerImagem.mutateAsync(imagemId);
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Fotos</h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="btn-secondary"
        >
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {enviando ? `Enviando... ${progresso}%` : 'Adicionar fotos'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleSelecionarArquivos}
        />
      </div>

      {imagens.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          Nenhuma foto ainda. A primeira foto enviada vira a imagem principal automaticamente.
        </p>
      ) : (
        <SortableList
          items={imagens}
          orientation="grid"
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
          handleClassName="left-1 top-1"
          onReorder={(novaOrdem) =>
            reordenarImagens.mutate(novaOrdem.map((imagem, index) => ({ id: imagem.id, ordem: index })))
          }
          renderItem={(imagem) => (
            <div className="group relative aspect-square overflow-hidden rounded-xl bg-gray-50 ring-1 ring-inset ring-gray-100">
              <Image src={imagem.url} alt="" fill sizes="150px" className="object-cover" />

              {imagem.principal && (
                <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                  <Star className="h-3 w-3 fill-brand-500 text-brand-500" />
                  Principal
                </span>
              )}

              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!imagem.principal && (
                  <button
                    type="button"
                    onClick={() => marcarPrincipal.mutate(imagem.id)}
                    aria-label="Marcar como imagem principal"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-brand-600"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemover(imagem.id)}
                  disabled={removendoId === imagem.id}
                  aria-label="Remover imagem"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-red-500"
                >
                  {removendoId === imagem.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}

function GaleriaVideos({
  produtoId,
  referencia,
  videos,
}: {
  produtoId: number;
  referencia: string;
  videos: VideoProdutoResponse[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { enviando, progresso, enviarArquivo } = useUpload();
  const adicionarVideo = useAdicionarVideoProduto(produtoId);
  const removerVideo = useRemoverVideoProduto(produtoId);
  const [removendoId, setRemovendoId] = useState<number | null>(null);

  async function handleSelecionarArquivos(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (arquivos.length === 0) return;

    for (const arquivo of arquivos) {
      try {
        const resultado = await enviarArquivo(arquivo, 'video', `produtos/${sanitizarSegmentoPasta(referencia)}`);
        if (resultado) {
          await adicionarVideo.mutateAsync({ url: resultado.url, publicId: resultado.publicId });
        }
      } catch (erro) {
        toast.error((erro as Error).message);
      }
    }
  }

  async function handleRemover(videoId: number) {
    setRemovendoId(videoId);
    try {
      await removerVideo.mutateAsync(videoId);
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Vídeos</h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando}
          className="btn-secondary"
        >
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {enviando ? `Enviando... ${progresso}%` : 'Adicionar vídeos'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={handleSelecionarArquivos}
        />
      </div>

      {videos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          Nenhum vídeo ainda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {videos.map((video) => (
            <div key={video.id} className="group relative aspect-video overflow-hidden rounded-xl bg-gray-900">
              <video src={video.url} className="h-full w-full object-cover" muted />
              <button
                type="button"
                onClick={() => handleRemover(video.id)}
                disabled={removendoId === video.id}
                aria-label="Remover vídeo"
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-500 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
              >
                {removendoId === video.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
