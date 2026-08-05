package com.frutodamalha.catalogo.service.impl;

import com.frutodamalha.catalogo.domain.entity.Colecao;
import com.frutodamalha.catalogo.dto.request.ColecaoRequest;
import com.frutodamalha.catalogo.dto.response.ColecaoResponse;
import com.frutodamalha.catalogo.exception.BusinessRuleException;
import com.frutodamalha.catalogo.exception.ResourceNotFoundException;
import com.frutodamalha.catalogo.mapper.ColecaoMapper;
import com.frutodamalha.catalogo.repository.ColecaoRepository;
import com.frutodamalha.catalogo.repository.ProdutoRepository;
import com.frutodamalha.catalogo.service.ColecaoService;
import com.frutodamalha.catalogo.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ColecaoServiceImpl implements ColecaoService {

    private final ColecaoRepository colecaoRepository;
    private final ProdutoRepository produtoRepository;
    private final ColecaoMapper colecaoMapper;

    @Override
    public List<ColecaoResponse> listarPublico() {
        return colecaoRepository.findAllByAtivoTrueOrderByNomeAsc().stream().map(this::toResponse).toList();
    }

    @Override
    public List<ColecaoResponse> listarAdmin() {
        return colecaoRepository.findAllByOrderByNomeAsc().stream().map(this::toResponse).toList();
    }

    @Override
    public ColecaoResponse buscarPorSlug(String slug) {
        return toResponse(colecaoRepository.findBySlug(slug).orElseThrow(() -> ResourceNotFoundException.of("Coleção", slug)));
    }

    @Override
    public ColecaoResponse buscarPorId(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Override
    @Transactional
    public ColecaoResponse criar(ColecaoRequest request) {
        Colecao colecao = colecaoMapper.toEntity(request);
        colecao.setSlug(gerarSlugUnico(request.nome(), null));
        colecaoRepository.save(colecao);
        return toResponse(colecao);
    }

    @Override
    @Transactional
    public ColecaoResponse atualizar(Long id, ColecaoRequest request) {
        Colecao colecao = buscarEntidade(id);
        colecaoMapper.atualizarEntidade(request, colecao);
        colecao.setSlug(gerarSlugUnico(request.nome(), id));
        return toResponse(colecao);
    }

    @Override
    @Transactional
    public void excluir(Long id) {
        Colecao colecao = buscarEntidade(id);
        if (produtoRepository.existsByColecaoIdAndDeletedAtIsNull(id)) {
            throw new BusinessRuleException(
                    "Não é possível excluir a coleção \"%s\" pois há produtos vinculados a ela.".formatted(colecao.getNome()));
        }
        colecaoRepository.delete(colecao);
    }

    private Colecao buscarEntidade(Long id) {
        return colecaoRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Coleção", id));
    }

    private String gerarSlugUnico(String nome, Long idParaIgnorar) {
        String base = SlugUtils.gerar(nome);
        String candidato = base;
        int sufixo = 2;
        while (idParaIgnorar == null ? colecaoRepository.existsBySlug(candidato) : colecaoRepository.existsBySlugAndIdNot(candidato, idParaIgnorar)) {
            candidato = base + "-" + sufixo++;
        }
        return candidato;
    }

    private ColecaoResponse toResponse(Colecao colecao) {
        long total = produtoRepository.countByColecaoIdAndDeletedAtIsNull(colecao.getId());
        return colecaoMapper.toResponse(colecao, total);
    }
}
