package com.frutodamalha.catalogo.repository;

import com.frutodamalha.catalogo.domain.entity.Produto;
import com.frutodamalha.catalogo.domain.enums.StatusProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {

    Optional<Produto> findByReferenciaAndDeletedAtIsNull(String referencia);

    @Query("SELECT COALESCE(MAX(p.ordem), -1) FROM Produto p")
    int buscarMaiorOrdem();

    boolean existsByReferencia(String referencia);

    boolean existsByReferenciaAndIdNot(String referencia, Long id);

    boolean existsByCategoriaIdAndDeletedAtIsNull(Long categoriaId);

    boolean existsByColecaoIdAndDeletedAtIsNull(Long colecaoId);

    long countByCategoriaIdAndDeletedAtIsNull(Long categoriaId);

    long countByColecaoIdAndDeletedAtIsNull(Long colecaoId);

    long countByDeletedAtIsNull();

    long countByStatusAndDeletedAtIsNull(StatusProduto status);
}
