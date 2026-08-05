package com.frutodamalha.catalogo.dto.response;

public record CategoriaResponse(
        Long id,
        String nome,
        String slug,
        String descricao,
        String imagemUrl,
        Integer ordem,
        boolean ativo,
        long totalProdutos
) {
}
