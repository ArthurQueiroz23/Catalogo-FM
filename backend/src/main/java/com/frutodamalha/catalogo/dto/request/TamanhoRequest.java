package com.frutodamalha.catalogo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TamanhoRequest(

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 20, message = "Nome deve ter no máximo 20 caracteres")
        String nome,

        Boolean ativo
) {
}
