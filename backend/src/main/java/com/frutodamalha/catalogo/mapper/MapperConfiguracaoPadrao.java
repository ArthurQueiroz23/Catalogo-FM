package com.frutodamalha.catalogo.mapper;

import org.mapstruct.MapperConfig;
import org.mapstruct.ReportingPolicy;

/**
 * Configuração compartilhada por todos os mappers do projeto. {@code unmappedTargetPolicy=IGNORE}
 * porque toda entidade herda {@code createdAt}/{@code updatedAt} de {@code BaseEntity}, que
 * nenhum DTO de request precisa (são preenchidos automaticamente pelo Spring Data JPA Auditing —
 * ver {@code JpaAuditingConfig}) — sem isso, cada mapper emitiria um warning de "unmapped target
 * property" nesses dois campos.
 */
@MapperConfig(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperConfiguracaoPadrao {
}
