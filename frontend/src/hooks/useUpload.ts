import { useState } from 'react';
import * as adminApi from '@/lib/admin-api';
import { ApiError } from '@/lib/api';
import { enviarArquivoCloudinary, validarArquivo, type ArquivoEnviado } from '@/lib/cloudinary-upload';
import type { CloudinaryResourceType } from '@/types/api';

interface UseUploadResultado {
  enviando: boolean;
  progresso: number;
  /** Faz o fluxo completo: pede assinatura ao backend, depois envia direto ao Cloudinary. */
  enviarArquivo: (arquivo: File, tipo: CloudinaryResourceType, pasta: string) => Promise<ArquivoEnviado | null>;
}

/**
 * Encapsula o fluxo de upload direto ao Cloudinary (ver docs/ARCHITECTURE.md §2.8): valida o
 * arquivo, pede uma assinatura curta ao backend e só então envia o binário direto ao Cloudinary
 * a partir do navegador — o backend nunca recebe o arquivo. Erros são retornados como string
 * (não lançados) para o chamador decidir como exibir, já que uploads costumam acontecer em
 * lote (várias fotos de uma vez) e uma falha isolada não deve interromper as demais.
 */
export function useUpload(): UseUploadResultado {
  const [enviando, setEnviando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  async function enviarArquivo(
    arquivo: File,
    tipo: CloudinaryResourceType,
    pasta: string
  ): Promise<ArquivoEnviado | null> {
    const erroValidacao = validarArquivo(arquivo, tipo);
    if (erroValidacao) {
      throw new Error(erroValidacao);
    }

    setEnviando(true);
    setProgresso(0);
    try {
      const assinatura = await adminApi.gerarAssinaturaUpload({ resourceType: tipo, folder: pasta });
      const resultado = await enviarArquivoCloudinary(arquivo, tipo, assinatura, setProgresso);
      return resultado;
    } catch (erro) {
      const mensagem = erro instanceof ApiError ? erro.message : (erro as Error).message;
      throw new Error(mensagem || 'Falha ao enviar o arquivo.');
    } finally {
      setEnviando(false);
      setProgresso(0);
    }
  }

  return { enviando, progresso, enviarArquivo };
}
