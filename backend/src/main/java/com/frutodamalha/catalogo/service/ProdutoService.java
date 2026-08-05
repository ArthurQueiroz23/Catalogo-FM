package com.frutodamalha.catalogo.service;

import com.frutodamalha.catalogo.domain.enums.StatusProduto;
import com.frutodamalha.catalogo.dto.common.PageResponse;
import com.frutodamalha.catalogo.dto.request.ImagemProdutoRequest;
import com.frutodamalha.catalogo.dto.request.ProdutoFiltro;
import com.frutodamalha.catalogo.dto.request.ProdutoRequest;
import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.request.VideoProdutoRequest;
import com.frutodamalha.catalogo.dto.response.ProdutoResponse;
import com.frutodamalha.catalogo.dto.response.ProdutoSummaryResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProdutoService {

    PageResponse<ProdutoSummaryResponse> listar(ProdutoFiltro filtro, Pageable pageable);

    ProdutoResponse buscarPorReferencia(String referencia);

    ProdutoResponse buscarPorId(Long id);

    List<ProdutoSummaryResponse> listarDestaques();

    List<ProdutoSummaryResponse> listarLancamentos();

    ProdutoResponse criar(ProdutoRequest request);

    ProdutoResponse atualizar(Long id, ProdutoRequest request);

    void excluir(Long id);

    ProdutoResponse alterarStatus(Long id, StatusProduto status);

    ProdutoResponse duplicar(Long id);

    void reordenar(List<ReordenarItemRequest> itens);

    ProdutoResponse adicionarImagem(Long produtoId, ImagemProdutoRequest request);

    void removerImagem(Long produtoId, Long imagemId);

    ProdutoResponse marcarImagemPrincipal(Long produtoId, Long imagemId);

    void reordenarImagens(Long produtoId, List<ReordenarItemRequest> itens);

    ProdutoResponse adicionarVideo(Long produtoId, VideoProdutoRequest request);

    void removerVideo(Long produtoId, Long videoId);
}
