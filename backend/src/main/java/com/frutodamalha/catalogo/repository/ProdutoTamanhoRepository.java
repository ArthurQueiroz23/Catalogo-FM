package com.frutodamalha.catalogo.repository;

import com.frutodamalha.catalogo.domain.entity.ProdutoTamanho;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoTamanhoRepository extends JpaRepository<ProdutoTamanho, Long> {

    boolean existsByTamanhoId(Long tamanhoId);
}
