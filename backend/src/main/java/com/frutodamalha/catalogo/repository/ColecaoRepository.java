package com.frutodamalha.catalogo.repository;

import com.frutodamalha.catalogo.domain.entity.Colecao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ColecaoRepository extends JpaRepository<Colecao, Long> {

    Optional<Colecao> findBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsBySlug(String slug);

    List<Colecao> findAllByOrderByNomeAsc();

    List<Colecao> findAllByAtivoTrueOrderByNomeAsc();
}
