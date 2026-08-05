package com.frutodamalha.catalogo.exception;

/**
 * Lançada quando uma operação viola uma regra de negócio (ex.: referência de produto duplicada,
 * exclusão de categoria com produtos vinculados). Mapeada para HTTP 409 pelo
 * {@code GlobalExceptionHandler}.
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
