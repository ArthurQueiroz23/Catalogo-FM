package com.frutodamalha.catalogo.dto.response;

public record LoginResponse(
        String token,
        String tipo,
        long expiraEm,
        UsuarioResponse usuario
) {
    public static LoginResponse of(String token, long expiraEmMs, UsuarioResponse usuario) {
        return new LoginResponse(token, "Bearer", System.currentTimeMillis() + expiraEmMs, usuario);
    }
}
