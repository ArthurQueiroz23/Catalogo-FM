package com.frutodamalha.catalogo.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

/**
 * Formato padrão de erro devolvido por {@code GlobalExceptionHandler}.
 * Ver docs/API_CONTRACT.md — "Formato padrão de erro" para o contrato exato com o frontend.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String erro,
        String mensagem,
        String path,
        List<CampoErro> campos
) {

    public record CampoErro(String campo, String mensagem) {
    }

    public static ApiErrorResponse of(int status, String erro, String mensagem, String path) {
        return new ApiErrorResponse(Instant.now(), status, erro, mensagem, path, null);
    }

    public static ApiErrorResponse of(int status, String erro, String mensagem, String path, List<CampoErro> campos) {
        return new ApiErrorResponse(Instant.now(), status, erro, mensagem, path, campos);
    }
}
