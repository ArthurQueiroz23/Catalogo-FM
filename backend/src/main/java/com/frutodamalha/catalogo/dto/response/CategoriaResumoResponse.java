package com.frutodamalha.catalogo.dto.response;

/** Versão enxuta de {@link CategoriaResponse}, usada quando a categoria aparece aninhada em outro DTO. */
public record CategoriaResumoResponse(Long id, String nome, String slug) {
}
