package com.frutodamalha.catalogo.dto.response;

public record ColecaoResponse(
        Long id,
        String nome,
        String slug,
        String descricao,
        boolean ativo,
        long totalProdutos
) {
}
