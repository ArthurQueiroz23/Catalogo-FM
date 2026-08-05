package com.frutodamalha.catalogo.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * Item de uma lista de reordenação (drag-and-drop). Reutilizado pelos endpoints
 * {@code PATCH /admin/{categorias,tamanhos,produtos}/reordenar} — ver docs/API_CONTRACT.md.
 */
public record ReordenarItemRequest(

        @NotNull(message = "Id é obrigatório")
        Long id,

        @NotNull(message = "Ordem é obrigatória")
        Integer ordem
) {
}
