package com.frutodamalha.catalogo.exception;

import com.frutodamalha.catalogo.dto.common.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

/**
 * Ponto único de tratamento de exceções da API. Todas as respostas de erro seguem o formato
 * {@link ApiErrorResponse} — ver docs/API_CONTRACT.md. Nunca expõe stacktrace ao cliente;
 * exceções não mapeadas explicitamente caem no handler genérico (500) e são logadas no servidor.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidacao(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ApiErrorResponse.CampoErro> campos = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiErrorResponse.CampoErro(fe.getField(), fe.getDefaultMessage()))
                .toList();

        var body = ApiErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "Erro de validação",
                "Um ou mais campos são inválidos",
                request.getRequestURI(),
                campos
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNaoEncontrado(ResourceNotFoundException ex, HttpServletRequest request) {
        var body = ApiErrorResponse.of(HttpStatus.NOT_FOUND.value(), "Recurso não encontrado", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiErrorResponse> handleRegraNegocio(BusinessRuleException ex, HttpServletRequest request) {
        var body = ApiErrorResponse.of(HttpStatus.CONFLICT.value(), "Operação não permitida", ex.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleJsonInvalido(HttpMessageNotReadableException ex, HttpServletRequest request) {
        var body = ApiErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "Requisição inválida",
                "O corpo da requisição está ausente ou mal formatado.",
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleParametroInvalido(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        var body = ApiErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "Parâmetro inválido",
                "O valor informado para \"%s\" é inválido.".formatted(ex.getName()),
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleParametroObrigatorioAusente(MissingServletRequestParameterException ex, HttpServletRequest request) {
        var body = ApiErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                "Parâmetro obrigatório ausente",
                "O parâmetro \"%s\" é obrigatório.".formatted(ex.getParameterName()),
                request.getRequestURI()
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleCredenciaisInvalidas(BadCredentialsException ex, HttpServletRequest request) {
        var body = ApiErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "Credenciais inválidas", "E-mail ou senha incorretos", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAutenticacao(AuthenticationException ex, HttpServletRequest request) {
        var body = ApiErrorResponse.of(HttpStatus.UNAUTHORIZED.value(), "Não autenticado", "É necessário autenticação para acessar este recurso", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAcessoNegado(AccessDeniedException ex, HttpServletRequest request) {
        var body = ApiErrorResponse.of(HttpStatus.FORBIDDEN.value(), "Acesso negado", "Você não tem permissão para executar esta ação", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenerico(Exception ex, HttpServletRequest request) {
        log.error("Erro não tratado ao processar {} {}", request.getMethod(), request.getRequestURI(), ex);
        var body = ApiErrorResponse.of(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erro interno",
                "Ocorreu um erro inesperado. Tente novamente em instantes.",
                request.getRequestURI()
        );
        return ResponseEntity.internalServerError().body(body);
    }
}
