package com.frutodamalha.catalogo.service;

import com.frutodamalha.catalogo.dto.request.ColecaoRequest;
import com.frutodamalha.catalogo.dto.response.ColecaoResponse;

import java.util.List;

public interface ColecaoService {

    List<ColecaoResponse> listarPublico();

    List<ColecaoResponse> listarAdmin();

    ColecaoResponse buscarPorSlug(String slug);

    ColecaoResponse buscarPorId(Long id);

    ColecaoResponse criar(ColecaoRequest request);

    ColecaoResponse atualizar(Long id, ColecaoRequest request);

    void excluir(Long id);
}
