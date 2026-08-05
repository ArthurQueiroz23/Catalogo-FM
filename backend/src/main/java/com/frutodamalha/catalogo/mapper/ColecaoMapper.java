package com.frutodamalha.catalogo.mapper;

import com.frutodamalha.catalogo.domain.entity.Colecao;
import com.frutodamalha.catalogo.dto.request.ColecaoRequest;
import com.frutodamalha.catalogo.dto.response.ColecaoResponse;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(config = MapperConfiguracaoPadrao.class)
public interface ColecaoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "ativo", constant = "true")
    Colecao toEntity(ColecaoRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    void atualizarEntidade(ColecaoRequest request, @MappingTarget Colecao colecao);

    @Mapping(target = "totalProdutos", source = "totalProdutos")
    ColecaoResponse toResponse(Colecao colecao, long totalProdutos);
}
