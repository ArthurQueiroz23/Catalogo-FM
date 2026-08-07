'use client';

import { ImageOff, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { toast } from 'sonner';
import { useUpload } from '@/hooks/useUpload';

interface SingleImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  pasta: string;
  label?: string;
}

/** Upload de uma única imagem (hoje usado na foto de capa da categoria). */
export function SingleImageUpload({ value, onChange, pasta, label = 'Imagem' }: SingleImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { enviando, progresso, enviarArquivo } = useUpload();

  async function handleSelecionarArquivo(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    event.target.value = '';
    if (!arquivo) return;

    try {
      const resultado = await enviarArquivo(arquivo, 'image', pasta);
      if (resultado) onChange(resultado.url);
    } catch (erro) {
      toast.error((erro as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.9375rem] font-semibold text-ink-700">{label}</span>
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-creme-50 ring-2 ring-inset ring-coral-100">
          {enviando ? (
            <div className="flex flex-col items-center gap-1 text-coral-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[10px] font-bold">{progresso}%</span>
            </div>
          ) : value ? (
            <Image src={value} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <ImageOff className="h-6 w-6 text-coral-200" />
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="btn-secondary"
          >
            <Upload className="h-4 w-4" />
            {value ? 'Trocar' : 'Enviar imagem'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={enviando}
              aria-label="Remover imagem"
              className="flex h-11 w-11 items-center justify-center rounded-pilula text-ink-400 transition-colors hover:bg-coral-50 hover:text-coral-800 foco-marca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleSelecionarArquivo} />
    </div>
  );
}
