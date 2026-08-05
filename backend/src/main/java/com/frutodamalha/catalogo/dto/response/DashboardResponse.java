package com.frutodamalha.catalogo.dto.response;

import java.util.List;

public record DashboardResponse(
        long totalProdutos,
        long totalProdutosAtivos,
        long totalProdutosOcultos,
        long totalCategorias,
        long totalColecoes,
        List<ProdutoSummaryResponse> produtosRecentes
) {
}
