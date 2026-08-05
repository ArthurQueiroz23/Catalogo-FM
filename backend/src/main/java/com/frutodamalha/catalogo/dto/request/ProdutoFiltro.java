package com.frutodamalha.catalogo.dto.request;

import com.frutodamalha.catalogo.domain.enums.Sexo;
import com.frutodamalha.catalogo.domain.enums.StatusProduto;

/**
 * Critérios de busca/filtro de produtos, montados pelo controller a partir dos query params
 * (ver docs/API_CONTRACT.md) e consumidos por {@code ProdutoSpecification}. Não é um DTO
 * desserializado de um corpo JSON — cada endpoint monta a instância adequada ao seu contexto
 * (público sempre força {@code status=ATIVO} e {@code incluirExcluidos=false}).
 */
public record ProdutoFiltro(
        String q,
        String categoriaSlug,
        String colecaoSlug,
        Sexo sexo,
        Boolean destaque,
        Boolean lancamento,
        StatusProduto status,
        boolean incluirExcluidos
) {

    public static ProdutoFiltro publico(String q, String categoriaSlug, String colecaoSlug, Sexo sexo) {
        return new ProdutoFiltro(q, categoriaSlug, colecaoSlug, sexo, null, null, StatusProduto.ATIVO, false);
    }

    public static ProdutoFiltro destaques() {
        return new ProdutoFiltro(null, null, null, null, true, null, StatusProduto.ATIVO, false);
    }

    public static ProdutoFiltro lancamentos() {
        return new ProdutoFiltro(null, null, null, null, null, true, StatusProduto.ATIVO, false);
    }

    public static ProdutoFiltro admin(String q, String categoriaSlug, String colecaoSlug, Sexo sexo,
                                       StatusProduto status, boolean incluirExcluidos) {
        return new ProdutoFiltro(q, categoriaSlug, colecaoSlug, sexo, null, null, status, incluirExcluidos);
    }
}
