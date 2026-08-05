package com.frutodamalha.catalogo.mapper;

import com.frutodamalha.catalogo.domain.entity.Categoria;
import com.frutodamalha.catalogo.domain.entity.Colecao;
import com.frutodamalha.catalogo.domain.entity.ImagemProduto;
import com.frutodamalha.catalogo.domain.entity.Produto;
import com.frutodamalha.catalogo.domain.entity.VideoProduto;
import com.frutodamalha.catalogo.dto.request.ProdutoRequest;
import com.frutodamalha.catalogo.dto.response.CategoriaResumoResponse;
import com.frutodamalha.catalogo.dto.response.ColecaoResumoResponse;
import com.frutodamalha.catalogo.dto.response.ImagemProdutoResponse;
import com.frutodamalha.catalogo.dto.response.ProdutoResponse;
import com.frutodamalha.catalogo.dto.response.ProdutoSummaryResponse;
import com.frutodamalha.catalogo.dto.response.TamanhoResumoResponse;
import com.frutodamalha.catalogo.dto.response.VideoProdutoResponse;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * Campos que dependem de composição (tamanhos disponíveis, imagem de capa) são calculados no
 * {@code ProdutoServiceImpl} e passados como parâmetro extra — o MapStruct resolve
 * automaticamente cada propriedade do DTO a partir de qualquer um dos parâmetros de origem
 * pelo nome, então não há ambiguidade apesar de existir mais de uma fonte.
 */
@Mapper(config = MapperConfiguracaoPadrao.class)
public interface ProdutoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "colecao", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "ordem", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "imagens", ignore = true)
    @Mapping(target = "videos", ignore = true)
    @Mapping(target = "produtoTamanhos", ignore = true)
    Produto toEntity(ProdutoRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "colecao", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "ordem", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "imagens", ignore = true)
    @Mapping(target = "videos", ignore = true)
    @Mapping(target = "produtoTamanhos", ignore = true)
    void atualizarEntidade(ProdutoRequest request, @MappingTarget Produto produto);

    ProdutoResponse toResponse(Produto produto, List<TamanhoResumoResponse> tamanhosDisponiveis);

    @Mapping(target = "categoriaNome", source = "produto.categoria.nome")
    @Mapping(target = "imagemPrincipalUrl", source = "imagemPrincipalUrl")
    ProdutoSummaryResponse toSummary(Produto produto, String imagemPrincipalUrl);

    CategoriaResumoResponse toResumo(Categoria categoria);

    ColecaoResumoResponse toResumo(Colecao colecao);

    ImagemProdutoResponse toResponse(ImagemProduto imagem);

    VideoProdutoResponse toResponse(VideoProduto video);
}
