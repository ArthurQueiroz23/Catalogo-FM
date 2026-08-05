package com.frutodamalha.catalogo.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Junção explícita Produto ↔ Tamanho (não M:N pura) — é o ponto de extensão natural para
 * futuramente adicionar {@code quantidadeEstoque} sem redesenhar o modelo (ver
 * docs/ARCHITECTURE.md §5).
 */
@Entity
@Table(name = "produto_tamanho", uniqueConstraints = @UniqueConstraint(columnNames = {"produto_id", "tamanho_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ProdutoTamanho extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tamanho_id", nullable = false)
    private Tamanho tamanho;

    @Column(nullable = false)
    private boolean disponivel = true;

    public ProdutoTamanho(Produto produto, Tamanho tamanho) {
        this.produto = produto;
        this.tamanho = tamanho;
        this.disponivel = true;
    }
}
