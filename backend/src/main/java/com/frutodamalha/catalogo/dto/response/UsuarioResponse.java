package com.frutodamalha.catalogo.dto.response;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        String role
) {
}
