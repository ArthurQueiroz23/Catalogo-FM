package com.frutodamalha.catalogo.dto.request;

import com.frutodamalha.catalogo.domain.enums.Sexo;
import com.frutodamalha.catalogo.domain.enums.StatusProduto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record ProdutoRequest(

        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 160, message = "Nome deve ter no máximo 160 caracteres")
        String nome,

        @NotBlank(message = "Referência é obrigatória")
        @Size(max = 40, message = "Referência deve ter no máximo 40 caracteres")
        String referencia,

        @Size(max = 8000, message = "Descrição deve ter no máximo 8000 caracteres")
        String descricao,

        @NotNull(message = "Preço é obrigatório")
        @DecimalMin(value = "0.0", message = "Preço não pode ser negativo")
        @Digits(integer = 8, fraction = 2, message = "Preço inválido")
        BigDecimal preco,

        @NotNull(message = "Categoria é obrigatória")
        Long categoriaId,

        Long colecaoId,

        @Size(max = 120, message = "Tecido deve ter no máximo 120 caracteres")
        String tecido,

        @NotNull(message = "Sexo é obrigatório")
        Sexo sexo,

        StatusProduto status,

        @Size(max = 4000, message = "Observações devem ter no máximo 4000 caracteres")
        String observacoes,

        boolean destaque,

        boolean lancamento,

        List<Long> tamanhoIds
) {
}
