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
import java.util.Set;
import java.util.stream.Collectors;

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

    /**
     * Ajusta o conjunto de tamanhos disponíveis para exatamente o informado.
     *
     * <p>Faz a diferença entre o que já existe e o que se quer, em vez de limpar tudo e recriar.
     * Limpar e recriar parece equivalente, mas quebra: com {@code orphanRemoval}, o Hibernate
     * enfileira o INSERT das linhas novas antes do DELETE das órfãs, e um tamanho que
     * permaneceu selecionado colide com ele mesmo na constraint única
     * {@code uk_produto_tamanho} — toda edição de produto que mantivesse algum tamanho falhava
     * com erro 500.
     *
     * <p>Fazendo a diferença, as linhas que não mudaram nunca são tocadas: não há INSERT para
     * colidir, e de quebra o UPDATE fica mais barato.
     */
    public void definirTamanhos(List<Tamanho> tamanhos) {
        Set<Long> idsDesejados = tamanhos.stream()
                .map(Tamanho::getId)
                .collect(Collectors.toSet());

        this.produtoTamanhos.removeIf(pt -> !idsDesejados.contains(pt.getTamanho().getId()));

        Set<Long> idsJaPresentes = this.produtoTamanhos.stream()
                .map(pt -> pt.getTamanho().getId())
                .collect(Collectors.toSet());

        for (Tamanho tamanho : tamanhos) {
            if (idsJaPresentes.add(tamanho.getId())) {
                this.produtoTamanhos.add(new ProdutoTamanho(this, tamanho));
            }
        }
    }
}
