package com.frutodamalha.catalogo.dto.request;

import com.frutodamalha.catalogo.domain.enums.StatusProduto;
import jakarta.validation.constraints.NotNull;

public record AlterarStatusProdutoRequest(

        @NotNull(message = "Status é obrigatório")
        StatusProduto status
) {
}
