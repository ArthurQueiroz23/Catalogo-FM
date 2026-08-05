package com.frutodamalha.catalogo.dto.response;

public record TamanhoResponse(
        Long id,
        String nome,
        Integer ordem,
        boolean ativo
) {
}
