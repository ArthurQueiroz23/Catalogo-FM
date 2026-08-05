package com.frutodamalha.catalogo.dto.request;

import jakarta.validation.constraints.NotBlank;

public record VideoProdutoRequest(

        @NotBlank(message = "URL é obrigatória")
        String url,

        @NotBlank(message = "publicId é obrigatório")
        String publicId
) {
}
