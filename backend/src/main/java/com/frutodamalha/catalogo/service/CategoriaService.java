package com.frutodamalha.catalogo.service;

import com.frutodamalha.catalogo.dto.request.CategoriaRequest;
import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.response.CategoriaResponse;

import java.util.List;

public interface CategoriaService {

    List<CategoriaResponse> listarPublico();

    List<CategoriaResponse> listarAdmin();

    CategoriaResponse buscarPorSlug(String slug);

    CategoriaResponse buscarPorId(Long id);

    CategoriaResponse criar(CategoriaRequest request);

    CategoriaResponse atualizar(Long id, CategoriaRequest request);

    void excluir(Long id);

    void reordenar(List<ReordenarItemRequest> itens);
}
