package com.frutodamalha.catalogo.domain.enums;

/**
 * Controla a visibilidade pública do produto ("ocultar"/"ativar"). Não confundir com exclusão:
 * exclusão usa {@code Produto.deletedAt} (soft delete), ver docs/ARCHITECTURE.md §2.5.
 */
public enum StatusProduto {
    ATIVO,
    INATIVO
}
