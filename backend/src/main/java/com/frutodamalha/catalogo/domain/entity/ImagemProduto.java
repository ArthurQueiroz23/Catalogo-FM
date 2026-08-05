package com.frutodamalha.catalogo.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "imagem_produto")
@Getter
@Setter
@NoArgsConstructor
public class ImagemProduto extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false, length = 500)
    private String url;

    /** Identificador do asset no Cloudinary — necessário para apagar o arquivo remoto. */
    @Column(name = "public_id", nullable = false, length = 300)
    private String publicId;

    @Column(nullable = false)
    private boolean principal = false;

    @Column(nullable = false)
    private Integer ordem = 0;
}
