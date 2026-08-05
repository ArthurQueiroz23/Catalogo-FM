package com.frutodamalha.catalogo.repository;

import com.frutodamalha.catalogo.domain.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsBySlug(String slug);

    List<Categoria> findAllByOrderByOrdemAsc();

    List<Categoria> findAllByAtivoTrueOrderByOrdemAsc();
}
