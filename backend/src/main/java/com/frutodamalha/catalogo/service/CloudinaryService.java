package com.frutodamalha.catalogo.service;

import com.frutodamalha.catalogo.dto.response.UploadSignatureResponse;

public interface CloudinaryService {

    /**
     * Gera uma assinatura de upload de curta duração para que o navegador envie o arquivo
     * diretamente ao Cloudinary, sem que o backend precise receber o binário. Ver
     * docs/ARCHITECTURE.md §2.8. {@code resource_type} não faz parte dos parâmetros assinados
     * do Cloudinary (é só um segmento da URL de upload que o próprio frontend já conhece), por
     * isso não é recebido aqui.
     */
    UploadSignatureResponse gerarAssinaturaUpload(String pasta);

    /** Remove um asset (imagem ou vídeo) do Cloudinary a partir do seu public_id. */
    void excluirAsset(String publicId, String resourceType);
}
