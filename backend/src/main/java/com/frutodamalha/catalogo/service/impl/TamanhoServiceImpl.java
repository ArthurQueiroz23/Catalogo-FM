package com.frutodamalha.catalogo.service.impl;

import com.frutodamalha.catalogo.domain.entity.Tamanho;
import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.request.TamanhoRequest;
import com.frutodamalha.catalogo.dto.response.TamanhoResponse;
import com.frutodamalha.catalogo.exception.BusinessRuleException;
import com.frutodamalha.catalogo.exception.ResourceNotFoundException;
import com.frutodamalha.catalogo.mapper.TamanhoMapper;
import com.frutodamalha.catalogo.repository.ProdutoTamanhoRepository;
import com.frutodamalha.catalogo.repository.TamanhoRepository;
import com.frutodamalha.catalogo.service.TamanhoService;
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
public class TamanhoServiceImpl implements TamanhoService {

    private final TamanhoRepository tamanhoRepository;
    private final ProdutoTamanhoRepository produtoTamanhoRepository;
    private final TamanhoMapper tamanhoMapper;

    @Override
    public List<TamanhoResponse> listarPublico() {
        return tamanhoRepository.findAllByAtivoTrueOrderByOrdemAsc().stream().map(tamanhoMapper::toResponse).toList();
    }

    @Override
    public List<TamanhoResponse> listarAdmin() {
        return tamanhoRepository.findAllByOrderByOrdemAsc().stream().map(tamanhoMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public TamanhoResponse criar(TamanhoRequest request) {
        validarNomeUnico(request.nome(), null);
        Tamanho tamanho = tamanhoMapper.toEntity(request);
        tamanho.setOrdem(proximaOrdem());
        tamanhoRepository.save(tamanho);
        return tamanhoMapper.toResponse(tamanho);
    }

    @Override
    @Transactional
    public TamanhoResponse atualizar(Long id, TamanhoRequest request) {
        validarNomeUnico(request.nome(), id);
        Tamanho tamanho = buscarEntidade(id);
        tamanhoMapper.atualizarEntidade(request, tamanho);
        return tamanhoMapper.toResponse(tamanho);
    }

    @Override
    @Transactional
    public void excluir(Long id) {
        Tamanho tamanho = buscarEntidade(id);
        if (produtoTamanhoRepository.existsByTamanhoId(id)) {
            throw new BusinessRuleException(
                    "Não é possível excluir o tamanho \"%s\" pois há produtos que o utilizam.".formatted(tamanho.getNome()));
        }
        tamanhoRepository.delete(tamanho);
    }

    @Override
    @Transactional
    public void reordenar(List<ReordenarItemRequest> itens) {
        Map<Long, Tamanho> tamanhosPorId = tamanhoRepository.findAllById(itens.stream().map(ReordenarItemRequest::id).toList())
                .stream().collect(Collectors.toMap(Tamanho::getId, Function.identity()));

        for (ReordenarItemRequest item : itens) {
            Tamanho tamanho = tamanhosPorId.get(item.id());
            if (tamanho == null) {
                throw ResourceNotFoundException.of("Tamanho", item.id());
            }
            tamanho.setOrdem(item.ordem());
        }
    }

    private void validarNomeUnico(String nome, Long idParaIgnorar) {
        boolean emUso = idParaIgnorar == null
                ? tamanhoRepository.existsByNomeIgnoreCase(nome)
                : tamanhoRepository.existsByNomeIgnoreCaseAndIdNot(nome, idParaIgnorar);
        if (emUso) {
            throw new BusinessRuleException("Já existe um tamanho com o nome \"%s\".".formatted(nome));
        }
    }

    private Tamanho buscarEntidade(Long id) {
        return tamanhoRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Tamanho", id));
    }

    private int proximaOrdem() {
        return tamanhoRepository.findAllByOrderByOrdemAsc().stream()
                .mapToInt(Tamanho::getOrdem)
                .max()
                .orElse(-1) + 1;
    }
}
