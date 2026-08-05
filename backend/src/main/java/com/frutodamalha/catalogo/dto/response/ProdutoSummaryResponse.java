package com.frutodamalha.catalogo.dto.response;

import java.math.BigDecimal;

/**
 * Versão enxuta de {@link ProdutoResponse} usada em listagens (catálogo, busca, painel) —
 * evita carregar descrição completa, vídeos e todas as imagens quando só a capa é exibida.
 */
public record ProdutoSummaryResponse(
        Long id,
        String nome,
        String referencia,
        BigDecimal preco,
        String categoriaNome,
        String imagemPrincipalUrl,
        String status,
        boolean destaque,
        boolean lancamento
) {
}
