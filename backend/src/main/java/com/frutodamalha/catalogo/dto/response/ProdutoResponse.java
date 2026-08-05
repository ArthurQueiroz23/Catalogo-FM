package com.frutodamalha.catalogo.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProdutoResponse(
        Long id,
        String nome,
        String referencia,
        String descricao,
        BigDecimal preco,
        CategoriaResumoResponse categoria,
        ColecaoResumoResponse colecao,
        String tecido,
        String sexo,
        String status,
        String observacoes,
        boolean destaque,
        boolean lancamento,
        List<TamanhoResumoResponse> tamanhosDisponiveis,
        List<ImagemProdutoResponse> imagens,
        List<VideoProdutoResponse> videos
) {
}
