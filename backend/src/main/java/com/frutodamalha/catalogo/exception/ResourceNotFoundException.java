package com.frutodamalha.catalogo.exception;

/** Lançada quando um recurso buscado por id/slug/referência não existe (ou já foi excluído). */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException of(String entidade, Object identificador) {
        return new ResourceNotFoundException("%s não encontrado(a): %s".formatted(entidade, identificador));
    }
}
