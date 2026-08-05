package com.frutodamalha.catalogo.mapper;

import com.frutodamalha.catalogo.domain.entity.Tamanho;
import com.frutodamalha.catalogo.dto.request.TamanhoRequest;
import com.frutodamalha.catalogo.dto.response.TamanhoResponse;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(config = MapperConfiguracaoPadrao.class)
public interface TamanhoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ordem", ignore = true)
    @Mapping(target = "ativo", constant = "true")
    Tamanho toEntity(TamanhoRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ordem", ignore = true)
    void atualizarEntidade(TamanhoRequest request, @MappingTarget Tamanho tamanho);

    TamanhoResponse toResponse(Tamanho tamanho);
}
