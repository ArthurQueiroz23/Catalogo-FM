package com.frutodamalha.catalogo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UploadSignatureRequest(

        @NotBlank(message = "resourceType é obrigatório")
        @Pattern(regexp = "image|video", message = "resourceType deve ser 'image' ou 'video'")
        String resourceType,

        // Aceita um ou mais segmentos separados por "/" (ex.: "categorias", "produtos/000180"),
        // para organizar a mídia por produto no Cloudinary — mas nunca ".." nem "/" nas pontas,
        // o que já impede path traversal já que pontos não são um caractere permitido em segmento.
        @NotBlank(message = "folder é obrigatório")
        @Pattern(
                regexp = "[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*",
                message = "folder deve conter apenas letras, números, hífen, underscore e \"/\" entre segmentos"
        )
        String folder
) {
}
