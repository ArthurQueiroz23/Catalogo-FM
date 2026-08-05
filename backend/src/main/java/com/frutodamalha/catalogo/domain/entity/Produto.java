package com.frutodamalha.catalogo.domain.entity;

import com.frutodamalha.catalogo.domain.enums.Sexo;
import com.frutodamalha.catalogo.domain.enums.StatusProduto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade central do catálogo. Ver docs/DATABASE_SCHEMA.md para o significado de cada campo
 * e docs/ARCHITECTURE.md §2.5 para a estratégia de exclusão (soft delete via {@code deletedAt}).
 */
@Entity
@Table(name = "produto")
@Getter
@Setter
@NoArgsConstructor
public class Produto extends BaseEntity {

    @Column(nullable = false, length = 160)
    private String nome;

    /** Identificador público/estável — usado na URL, na busca e na mensagem de WhatsApp. */
    @Column(nullable = false, unique = true, length = 40)
    private String referencia;

    @Column(columnDefinition = "text")
    private String descricao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "colecao_id")
    private Colecao colecao;

    @Column(length = 120)
    private String tecido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Sexo sexo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusProduto status = StatusProduto.ATIVO;

    @Column(columnDefinition = "text")
    private String observacoes;

    @Column(nullable = false)
    private boolean destaque = false;

    @Column(nullable = false)
    private boolean lancamento = false;

    @Column(nullable = false)
    private Integer ordem = 0;

    /** Soft delete — ver docs/ARCHITECTURE.md §2.5. Nulo = produto não excluído. */
    @Column(name = "deleted_at")
    private Instant deletedAt;

    @OneToMany(mappedBy = "produto", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<ImagemProduto> imagens = new ArrayList<>();

    @OneToMany(mappedBy = "produto", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    private List<VideoProduto> videos = new ArrayList<>();

    @OneToMany(mappedBy = "produto", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private List<ProdutoTamanho> produtoTamanhos = new ArrayList<>();

    public boolean isExcluido() {
        return deletedAt != null;
    }

    public void adicionarImagem(ImagemProduto imagem) {
        imagem.setProduto(this);
        this.imagens.add(imagem);
    }

    public void removerImagem(ImagemProduto imagem) {
        this.imagens.remove(imagem);
        imagem.setProduto(null);
    }

    public void adicionarVideo(VideoProduto video) {
        video.setProduto(this);
        this.videos.add(video);
    }

    public void removerVideo(VideoProduto video) {
        this.videos.remove(video);
        video.setProduto(null);
    }

    /** Substitui por completo o conjunto de tamanhos disponíveis (orphanRemoval limpa os antigos). */
    public void definirTamanhos(List<Tamanho> tamanhos) {
        this.produtoTamanhos.clear();
        for (Tamanho tamanho : tamanhos) {
            this.produtoTamanhos.add(new ProdutoTamanho(this, tamanho));
        }
    }
}
