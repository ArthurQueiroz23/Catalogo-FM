package com.frutodamalha.catalogo.service.impl;

import com.frutodamalha.catalogo.domain.entity.Categoria;
import com.frutodamalha.catalogo.dto.request.CategoriaRequest;
import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.response.CategoriaResponse;
import com.frutodamalha.catalogo.exception.BusinessRuleException;
import com.frutodamalha.catalogo.exception.ResourceNotFoundException;
import com.frutodamalha.catalogo.mapper.CategoriaMapper;
import com.frutodamalha.catalogo.repository.CategoriaRepository;
import com.frutodamalha.catalogo.repository.ProdutoRepository;
import com.frutodamalha.catalogo.service.CategoriaService;
import com.frutodamalha.catalogo.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;
    private final CategoriaMapper categoriaMapper;

    @Override
    public List<CategoriaResponse> listarPublico() {
        return mapearComTotalProdutos(categoriaRepository.findAllByAtivoTrueOrderByOrdemAsc());
    }

    @Override
    public List<CategoriaResponse> listarAdmin() {
        return mapearComTotalProdutos(categoriaRepository.findAllByOrderByOrdemAsc());
    }

    @Override
    public CategoriaResponse buscarPorSlug(String slug) {
        Categoria categoria = categoriaRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("Categoria", slug));
        return toResponse(categoria);
    }

    @Override
    public CategoriaResponse buscarPorId(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Override
    @Transactional
    public CategoriaResponse criar(CategoriaRequest request) {
        Categoria categoria = categoriaMapper.toEntity(request);
        categoria.setSlug(gerarSlugUnico(request.nome(), null));
        categoria.setOrdem(proximaOrdem());
        categoriaRepository.save(categoria);
        return toResponse(categoria);
    }

    @Override
    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscarEntidade(id);
        categoriaMapper.atualizarEntidade(request, categoria);
        categoria.setSlug(gerarSlugUnico(request.nome(), id));
        return toResponse(categoria);
    }

    @Override
    @Transactional
    public void excluir(Long id) {
        Categoria categoria = buscarEntidade(id);
        if (produtoRepository.existsByCategoriaIdAndDeletedAtIsNull(id)) {
            throw new BusinessRuleException(
                    "Não é possível excluir a categoria \"%s\" pois há produtos vinculados a ela.".formatted(categoria.getNome()));
        }
        categoriaRepository.delete(categoria);
    }

    @Override
    @Transactional
    public void reordenar(List<ReordenarItemRequest> itens) {
        Map<Long, Categoria> categoriasPorId = categoriaRepository.findAllById(itens.stream().map(ReordenarItemRequest::id).toList())
                .stream().collect(Collectors.toMap(Categoria::getId, Function.identity()));

        for (ReordenarItemRequest item : itens) {
            Categoria categoria = categoriasPorId.get(item.id());
            if (categoria == null) {
                throw ResourceNotFoundException.of("Categoria", item.id());
            }
            categoria.setOrdem(item.ordem());
        }
    }

    private Categoria buscarEntidade(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Categoria", id));
    }

    private int proximaOrdem() {
        return categoriaRepository.findAllByOrderByOrdemAsc().stream()
                .mapToInt(Categoria::getOrdem)
                .max()
                .orElse(-1) + 1;
    }

    private String gerarSlugUnico(String nome, Long idParaIgnorar) {
        String base = SlugUtils.gerar(nome);
        String candidato = base;
        int sufixo = 2;
        while (idParaIgnorar == null ? categoriaRepository.existsBySlug(candidato) : categoriaRepository.existsBySlugAndIdNot(candidato, idParaIgnorar)) {
            candidato = base + "-" + sufixo++;
        }
        return candidato;
    }

    private List<CategoriaResponse> mapearComTotalProdutos(List<Categoria> categorias) {
        return categorias.stream().map(this::toResponse).toList();
    }

    private CategoriaResponse toResponse(Categoria categoria) {
        long total = produtoRepository.countByCategoriaIdAndDeletedAtIsNull(categoria.getId());
        return categoriaMapper.toResponse(categoria, total);
    }
}
