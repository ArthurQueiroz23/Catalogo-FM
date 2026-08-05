package com.frutodamalha.catalogo.domain.enums;

/**
 * Papéis de acesso ao painel administrativo. Ser um enum (em vez de um simples boolean
 * "isAdmin") é o que permite adicionar VENDEDOR no futuro (docs/ARCHITECTURE.md §5) só
 * acrescentando uma constante, sem alterar o schema nem a lógica de autorização existente.
 */
public enum Role {
    ADMIN
}
