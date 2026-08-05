package com.frutodamalha.catalogo.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Tamanho administrável (não é enum) porque roupa infantil usa nomenclaturas variadas e não
 * padronizadas entre negócios (RN, P, M, G, 1 ano, 2 anos, ...). {@code ordem} define a
 * sequência correta de exibição, que não é alfabética (ver docs/DATABASE_SCHEMA.md).
 */
@Entity
@Table(name = "tamanho")
@Getter
@Setter
@NoArgsConstructor
public class Tamanho extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String nome;

    @Column(nullable = false)
    private Integer ordem = 0;

    @Column(nullable = false)
    private boolean ativo = true;
}
