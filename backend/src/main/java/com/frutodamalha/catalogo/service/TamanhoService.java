package com.frutodamalha.catalogo.service;

import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.request.TamanhoRequest;
import com.frutodamalha.catalogo.dto.response.TamanhoResponse;

import java.util.List;

public interface TamanhoService {

    List<TamanhoResponse> listarPublico();

    List<TamanhoResponse> listarAdmin();

    TamanhoResponse criar(TamanhoRequest request);

    TamanhoResponse atualizar(Long id, TamanhoRequest request);

    void excluir(Long id);

    void reordenar(List<ReordenarItemRequest> itens);
}
