package com.frutodamalha.catalogo.mapper;

import com.frutodamalha.catalogo.domain.entity.Categoria;
import com.frutodamalha.catalogo.dto.request.CategoriaRequest;
import com.frutodamalha.catalogo.dto.response.CategoriaResponse;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(config = MapperConfiguracaoPadrao.class)
public interface CategoriaMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "ordem", ignore = true)
    @Mapping(target = "ativo", constant = "true")
    Categoria toEntity(CategoriaRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "ordem", ignore = true)
    void atualizarEntidade(CategoriaRequest request, @MappingTarget Categoria categoria);

    @Mapping(target = "totalProdutos", source = "totalProdutos")
    CategoriaResponse toResponse(Categoria categoria, long totalProdutos);
}
