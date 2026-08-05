package com.frutodamalha.catalogo.service.impl;

import com.frutodamalha.catalogo.domain.enums.StatusProduto;
import com.frutodamalha.catalogo.dto.request.ProdutoFiltro;
import com.frutodamalha.catalogo.dto.response.DashboardResponse;
import com.frutodamalha.catalogo.repository.CategoriaRepository;
import com.frutodamalha.catalogo.repository.ColecaoRepository;
import com.frutodamalha.catalogo.repository.ProdutoRepository;
import com.frutodamalha.catalogo.service.DashboardService;
import com.frutodamalha.catalogo.service.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final int TOTAL_PRODUTOS_RECENTES = 5;

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ColecaoRepository colecaoRepository;
    private final ProdutoService produtoService;

    @Override
    public DashboardResponse obterResumo() {
        var pageable = PageRequest.of(0, TOTAL_PRODUTOS_RECENTES, Sort.by(Sort.Direction.DESC, "createdAt"));
        var filtroRecentes = ProdutoFiltro.admin(null, null, null, null, null, false);
        var recentes = produtoService.listar(filtroRecentes, pageable).content();

        return new DashboardResponse(
                produtoRepository.countByDeletedAtIsNull(),
                produtoRepository.countByStatusAndDeletedAtIsNull(StatusProduto.ATIVO),
                produtoRepository.countByStatusAndDeletedAtIsNull(StatusProduto.INATIVO),
                categoriaRepository.count(),
                colecaoRepository.count(),
                recentes
        );
    }
}
