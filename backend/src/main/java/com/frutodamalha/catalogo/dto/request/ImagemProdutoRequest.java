package com.frutodamalha.catalogo.dto.request;

import jakarta.validation.constraints.NotBlank;

/** URL e public_id já retornados pelo Cloudinary após o upload direto do navegador. */
public record ImagemProdutoRequest(

        @NotBlank(message = "URL é obrigatória")
        String url,

        @NotBlank(message = "publicId é obrigatório")
        String publicId
) {
}
