package com.frutodamalha.catalogo.specification;

import com.frutodamalha.catalogo.domain.entity.Categoria;
import com.frutodamalha.catalogo.domain.entity.Colecao;
import com.frutodamalha.catalogo.domain.entity.Produto;
import com.frutodamalha.catalogo.dto.request.ProdutoFiltro;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Compõe dinamicamente os filtros de {@code GET /produtos} (público) e
 * {@code GET /admin/produtos} (painel) a partir de {@link ProdutoFiltro} — ver
 * docs/ARCHITECTURE.md §2.9. Os joins com categoria/colecao são criados uma única vez e
 * reaproveitados tanto para os filtros de slug quanto para a busca livre, evitando joins
 * duplicados na mesma query.
 */
public final class ProdutoSpecification {

    private ProdutoSpecification() {
    }

    public static Specification<Produto> filtrar(ProdutoFiltro filtro) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<Produto, Categoria> categoriaJoin = root.join("categoria", JoinType.LEFT);
            Join<Produto, Colecao> colecaoJoin = root.join("colecao", JoinType.LEFT);

            if (!filtro.incluirExcluidos()) {
                predicates.add(cb.isNull(root.get("deletedAt")));
            }
            if (filtro.status() != null) {
                predicates.add(cb.equal(root.get("status"), filtro.status()));
            }
            if (StringUtils.hasText(filtro.categoriaSlug())) {
                predicates.add(cb.equal(categoriaJoin.get("slug"), filtro.categoriaSlug()));
            }
            if (StringUtils.hasText(filtro.colecaoSlug())) {
                predicates.add(cb.equal(colecaoJoin.get("slug"), filtro.colecaoSlug()));
            }
            if (filtro.sexo() != null) {
                predicates.add(cb.equal(root.get("sexo"), filtro.sexo()));
            }
            if (filtro.destaque() != null) {
                predicates.add(cb.equal(root.get("destaque"), filtro.destaque()));
            }
            if (filtro.lancamento() != null) {
                predicates.add(cb.equal(root.get("lancamento"), filtro.lancamento()));
            }
            if (StringUtils.hasText(filtro.q())) {
                String termo = "%" + filtro.q().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nome")), termo),
                        cb.like(cb.lower(root.get("referencia")), termo),
                        cb.like(cb.lower(cb.coalesce(root.get("descricao"), "")), termo),
                        cb.like(cb.lower(categoriaJoin.get("nome")), termo),
                        cb.like(cb.lower(cb.coalesce(colecaoJoin.get("nome"), "")), termo)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
