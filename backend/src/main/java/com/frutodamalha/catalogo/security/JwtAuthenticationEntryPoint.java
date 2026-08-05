package com.frutodamalha.catalogo.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.frutodamalha.catalogo.dto.common.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Responde 401 em JSON (mesmo formato de {@code GlobalExceptionHandler}) quando uma requisição
 * não autenticada tenta acessar um endpoint protegido. Necessário porque essa rejeição acontece
 * dentro da cadeia de filtros do Spring Security, antes de chegar ao {@code @RestControllerAdvice}.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        var body = ApiErrorResponse.of(
                HttpStatus.UNAUTHORIZED.value(),
                "Não autenticado",
                "É necessário autenticação para acessar este recurso",
                request.getRequestURI()
        );
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
