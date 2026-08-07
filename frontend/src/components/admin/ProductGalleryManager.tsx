'use client';

import { ImagePlus, Loader2, Play, Star, Trash2, UploadCloud } from 'lucide-react';
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

/**
 * Galeria da peça no painel. Um único ponto de entrada ("Adicionar mídia") aceita fotos e
 * vídeos ao mesmo tempo, por clique ou arrastando os arquivos para a área — o tipo de cada
 * arquivo decide sozinho para onde ele vai, sem a administradora precisar escolher antes.
 * Sem limite de quantidade; a ordem do carrossel público é a definida aqui por arrastar e soltar.
 */
export function ProductGalleryManager({ produtoId, referencia, imagens, videos }: ProductGalleryManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  const { enviando, progresso, enviarArquivo } = useUpload();
  const adicionarImagem = useAdicionarImagemProduto(produtoId);
  const adicionarVideo = useAdicionarVideoProduto(produtoId);
  const removerImagem = useRemoverImagemProduto(produtoId);
  const removerVideo = useRemoverVideoProduto(produtoId);
  const marcarPrincipal = useMarcarImagemPrincipal(produtoId);
  const reordenarImagens = useReordenarImagensProduto(produtoId);

  const pasta = `produtos/${sanitizarSegmentoPasta(referencia)}`;
  const total = imagens.length + videos.length;

  async function enviarArquivos(arquivos: File[]) {
    if (arquivos.length === 0) return;

    for (const arquivo of arquivos) {
      const ehVideo = arquivo.type.startsWith('video/');
      if (!ehVideo && !arquivo.type.startsWith('image/')) {
        toast.error(`"${arquivo.name}" não é uma foto nem um vídeo.`);
        continue;
      }
      try {
        const resultado = await enviarArquivo(arquivo, ehVideo ? 'video' : 'image', pasta);
        if (!resultado) continue;
        const payload = { url: resultado.url, publicId: resultado.publicId };
        await (ehVideo ? adicionarVideo.mutateAsync(payload) : adicionarImagem.mutateAsync(payload));
      } catch (erro) {
        toast.error((erro as Error).message);
      }
    }
  }

  async function remover(chave: string, acao: () => Promise<unknown>) {
    setRemovendoId(chave);
    try {
      await acao();
    } finally {
      setRemovendoId(null);
    }
  }

  const estiloAcaoMidia =
    'flex h-9 w-9 items-center justify-center rounded-pilula bg-creme/95 text-ink-500 shadow-peca ' +
    'transition-colors hover:text-coral-800 foco-marca';

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-ink-900">
          Fotos e vídeos {total > 0 && <span className="font-semibold text-ink-400">({total})</span>}
        </h3>
        {total > 0 && <p className="text-sm text-ink-400">Arraste para mudar a ordem</p>}
      </div>

      {/* Área única de envio: clique ou solte os arquivos aqui. */}
      <div
        onDragOver={(evento) => {
          evento.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(evento) => {
          evento.preventDefault();
          setArrastando(false);
          void enviarArquivos(Array.from(evento.dataTransfer.files));
        }}
        className={`rounded-peca border-2 border-dashed p-6 text-center transition-colors ${
          arrastando ? 'border-coral-400 bg-coral-50' : 'border-coral-200 bg-creme-50/60'
        }`}
      >
        <UploadCloud className={`mx-auto h-8 w-8 ${arrastando ? 'text-coral-500' : 'text-coral-300'}`} />
        <p className="mt-2 text-[0.9375rem] font-semibold text-ink-700">
          Arraste as fotos e os vídeos para cá
        </p>
        <p className="mt-0.5 text-sm text-ink-400">
          Pode enviar vários de uma vez. A primeira foto vira a capa da peça.
        </p>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={enviando} className="btn-secondary mt-4">
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {enviando ? `Enviando... ${progresso}%` : 'Adicionar mídia'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(evento) => {
            const arquivos = Array.from(evento.target.files ?? []);
            evento.target.value = '';
            void enviarArquivos(arquivos);
          }}
        />
      </div>

      {enviando && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-pilula bg-coral-100">
          <div
            className="h-full rounded-pilula bg-coral-400 transition-[width]"
            style={{ width: `${progresso}%` }}
          />
        </div>
      )}

      {imagens.length > 0 && (
        <SortableList
          items={imagens}
          orientation="grid"
          className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
          handleClassName="left-1 top-1"
          onReorder={(novaOrdem) =>
            reordenarImagens.mutate(novaOrdem.map((imagem, index) => ({ id: imagem.id, ordem: index })))
          }
          renderItem={(imagem) => (
            <div className="group relative aspect-square overflow-hidden rounded-2xl bg-creme-50 ring-2 ring-inset ring-coral-100">
              <Image src={imagem.url} alt="" fill sizes="150px" className="object-contain p-1" />

              {imagem.principal && (
                <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-pilula bg-coral-400 px-2 py-0.5 text-[10px] font-bold text-ink-900">
                  <Star className="h-3 w-3 fill-current" />
                  Capa
                </span>
              )}

              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                {!imagem.principal && (
                  <button
                    type="button"
                    onClick={() => marcarPrincipal.mutate(imagem.id)}
                    aria-label="Usar esta foto como capa"
                    className={estiloAcaoMidia}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remover(`img-${imagem.id}`, () => removerImagem.mutateAsync(imagem.id))}
                  disabled={removendoId === `img-${imagem.id}`}
                  aria-label="Remover foto"
                  className={estiloAcaoMidia}
                >
                  {removendoId === `img-${imagem.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        />
      )}

      {videos.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-ink-500">Vídeos</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {videos.map((video) => (
              <div key={video.id} className="group relative aspect-video overflow-hidden rounded-2xl bg-ink-900">
                <video src={video.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-creme/80">
                  <Play className="h-7 w-7 fill-current" />
                </span>
                <button
                  type="button"
                  onClick={() => remover(`vid-${video.id}`, () => removerVideo.mutateAsync(video.id))}
                  disabled={removendoId === `vid-${video.id}`}
                  aria-label="Remover vídeo"
                  className={`absolute right-1 top-1 opacity-0 focus-within:opacity-100 group-hover:opacity-100 ${estiloAcaoMidia}`}
                >
                  {removendoId === `vid-${video.id}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
