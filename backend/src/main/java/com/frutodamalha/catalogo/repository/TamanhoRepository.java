package com.frutodamalha.catalogo.repository;

import com.frutodamalha.catalogo.domain.entity.Tamanho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TamanhoRepository extends JpaRepository<Tamanho, Long> {

    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);

    boolean existsByNomeIgnoreCase(String nome);

    List<Tamanho> findAllByOrderByOrdemAsc();

    List<Tamanho> findAllByAtivoTrueOrderByOrdemAsc();
}
