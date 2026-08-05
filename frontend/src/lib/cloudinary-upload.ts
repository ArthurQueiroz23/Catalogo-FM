import type { CloudinaryResourceType, UploadSignatureResponse } from '@/types/api';

export const LIMITE_TAMANHO_IMAGEM_MB = 10;
export const LIMITE_TAMANHO_VIDEO_MB = 100;

export interface ArquivoEnviado {
  url: string;
  publicId: string;
}

// Bloco Unicode "Combining Diacritical Marks" (U+0300–U+036F) — os acentos ficam isolados assim
// depois de normalize('NFD'), então removê-los tira os acentos sem mexer nas letras base.
const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

/**
 * Normaliza um segmento de pasta do Cloudinary (ex.: a referência do produto) para bater com a
 * validação do backend (`UploadSignatureRequest.folder`, só letras/números/hífen/underscore por
 * segmento) — a referência é digitada livremente pela administradora e pode conter espaços ou
 * símbolos que quebrariam a assinatura de upload se fossem usados sem tratamento.
 */
export function sanitizarSegmentoPasta(segmento: string): string {
  return segmento
    .normalize('NFD')
    .replace(MARCAS_DIACRITICAS, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Valida um arquivo antes de gastar uma assinatura de upload com ele. Retorna uma mensagem de
 * erro em português pronta para exibir, ou `null` se o arquivo for válido.
 */
export function validarArquivo(arquivo: File, tipo: CloudinaryResourceType): string | null {
  if (tipo === 'image' && !arquivo.type.startsWith('image/')) {
    return 'Selecione um arquivo de imagem (JPG, PNG, WEBP...).';
  }
  if (tipo === 'video' && !arquivo.type.startsWith('video/')) {
    return 'Selecione um arquivo de vídeo (MP4, MOV...).';
  }

  const limiteMb = tipo === 'image' ? LIMITE_TAMANHO_IMAGEM_MB : LIMITE_TAMANHO_VIDEO_MB;
  const tamanhoMb = arquivo.size / (1024 * 1024);
  if (tamanhoMb > limiteMb) {
    return `Arquivo muito grande (${tamanhoMb.toFixed(1)}MB). O limite é ${limiteMb}MB.`;
  }

  return null;
}

/**
 * Envia um arquivo diretamente ao Cloudinary usando uma assinatura de curta duração obtida do
 * backend (ver docs/ARCHITECTURE.md §2.8 — o backend nunca recebe o binário). Usa
 * `XMLHttpRequest` em vez de `fetch` só para poder reportar progresso de upload, útil para
 * vídeos maiores.
 */
export function enviarArquivoCloudinary(
  arquivo: File,
  resourceType: CloudinaryResourceType,
  assinatura: UploadSignatureResponse,
  onProgresso?: (percentual: number) => void
): Promise<ArquivoEnviado> {
  const formData = new FormData();
  formData.append('file', arquivo);
  formData.append('api_key', assinatura.apiKey);
  formData.append('timestamp', String(assinatura.timestamp));
  formData.append('signature', assinatura.signature);
  formData.append('folder', assinatura.folder);

  const url = `https://api.cloudinary.com/v1_1/${assinatura.cloudName}/${resourceType}/upload`;

  return new Promise<ArquivoEnviado>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (event) => {
      if (onProgresso && event.lengthComputable) {
        onProgresso(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { secure_url: string; public_id: string };
          resolve({ url: data.secure_url, publicId: data.public_id });
        } catch {
          reject(new Error('Resposta inesperada do Cloudinary.'));
        }
      } else {
        reject(new Error('Falha ao enviar o arquivo para o Cloudinary.'));
      }
    };

    xhr.onerror = () => reject(new Error('Falha de rede ao enviar o arquivo para o Cloudinary.'));
    xhr.send(formData);
  });
}
