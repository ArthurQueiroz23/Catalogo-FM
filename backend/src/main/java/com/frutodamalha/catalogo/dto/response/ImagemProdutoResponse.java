package com.frutodamalha.catalogo.dto.response;

public record ImagemProdutoResponse(
        Long id,
        String url,
        boolean principal,
        Integer ordem
) {
}
