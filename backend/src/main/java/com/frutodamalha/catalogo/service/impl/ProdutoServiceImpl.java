package com.frutodamalha.catalogo.service.impl;

import com.frutodamalha.catalogo.domain.entity.Categoria;
import com.frutodamalha.catalogo.domain.entity.Colecao;
import com.frutodamalha.catalogo.domain.entity.ImagemProduto;
import com.frutodamalha.catalogo.domain.entity.Produto;
import com.frutodamalha.catalogo.domain.entity.ProdutoTamanho;
import com.frutodamalha.catalogo.domain.entity.Tamanho;
import com.frutodamalha.catalogo.domain.entity.VideoProduto;
import com.frutodamalha.catalogo.domain.enums.StatusProduto;
import com.frutodamalha.catalogo.dto.common.PageResponse;
import com.frutodamalha.catalogo.dto.request.ImagemProdutoRequest;
import com.frutodamalha.catalogo.dto.request.ProdutoFiltro;
import com.frutodamalha.catalogo.dto.request.ProdutoRequest;
import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.request.VideoProdutoRequest;
import com.frutodamalha.catalogo.dto.response.ProdutoResponse;
import com.frutodamalha.catalogo.dto.response.ProdutoSummaryResponse;
import com.frutodamalha.catalogo.dto.response.TamanhoResumoResponse;
import com.frutodamalha.catalogo.exception.BusinessRuleException;
import com.frutodamalha.catalogo.exception.ResourceNotFoundException;
import com.frutodamalha.catalogo.mapper.ProdutoMapper;
import com.frutodamalha.catalogo.repository.CategoriaRepository;
import com.frutodamalha.catalogo.repository.ColecaoRepository;
import com.frutodamalha.catalogo.repository.ProdutoRepository;
import com.frutodamalha.catalogo.repository.TamanhoRepository;
import com.frutodamalha.catalogo.service.CloudinaryService;
import com.frutodamalha.catalogo.service.ProdutoService;
import com.frutodamalha.catalogo.specification.ProdutoSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Serviço central do catálogo. Decisões relevantes documentadas em docs/ARCHITECTURE.md:
 * exclusão é soft delete (§2.5), busca via Specifications compostas (§2.9), mídia é apenas
 * URL + public_id apontando para o Cloudinary (§2.8). "Duplicar produto" copia os dados
 * estruturais (nome, preço, categoria, tamanhos etc.) mas **não** a galeria — replicar o
 * public_id do Cloudinary em duas linhas de produto diferentes criaria um vínculo perigoso
 * (excluir a imagem em um produto apagaria o asset remoto do outro também).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProdutoServiceImpl implements ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ColecaoRepository colecaoRepository;
    private final TamanhoRepository tamanhoRepository;
    private final ProdutoMapper produtoMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    public PageResponse<ProdutoSummaryResponse> listar(ProdutoFiltro filtro, Pageable pageable) {
        Page<Produto> pagina = produtoRepository.findAll(ProdutoSpecification.filtrar(filtro), pageable);
        return PageResponse.from(pagina, this::toSummary);
    }

    @Override
    public ProdutoResponse buscarPorReferencia(String referencia) {
        Produto produto = produtoRepository.findByReferenciaAndDeletedAtIsNull(referencia)
                .filter(p -> p.getStatus() == StatusProduto.ATIVO)
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", referencia));
        return toResponse(produto);
    }

    @Override
    public ProdutoResponse buscarPorId(Long id) {
        return toResponse(buscarEntidade(id));
    }

    @Override
    public List<ProdutoSummaryResponse> listarDestaques() {
        return listar(ProdutoFiltro.destaques(), org.springframework.data.domain.PageRequest.of(0, 12)).content();
    }

    @Override
    public List<ProdutoSummaryResponse> listarLancamentos() {
        return listar(ProdutoFiltro.lancamentos(), org.springframework.data.domain.PageRequest.of(0, 12)).content();
    }

    @Override
    @Transactional
    public ProdutoResponse criar(ProdutoRequest request) {
        validarReferenciaUnica(request.referencia(), null);

        Produto produto = produtoMapper.toEntity(request);
        produto.setCategoria(buscarCategoria(request.categoriaId()));
        produto.setColecao(buscarColecaoOuNull(request.colecaoId()));
        produto.setStatus(request.status() != null ? request.status() : StatusProduto.ATIVO);
        produto.setOrdem(proximaOrdem());
        produto.definirTamanhos(buscarTamanhos(request.tamanhoIds()));

        produtoRepository.save(produto);
        return toResponse(produto);
    }

    @Override
    @Transactional
    public ProdutoResponse atualizar(Long id, ProdutoRequest request) {
        Produto produto = buscarEntidade(id);
        validarReferenciaUnica(request.referencia(), id);

        produtoMapper.atualizarEntidade(request, produto);
        produto.setCategoria(buscarCategoria(request.categoriaId()));
        produto.setColecao(buscarColecaoOuNull(request.colecaoId()));
        if (request.status() != null) {
            produto.setStatus(request.status());
        }
        produto.definirTamanhos(buscarTamanhos(request.tamanhoIds()));

        return toResponse(produto);
    }

    @Override
    @Transactional
    public void excluir(Long id) {
        Produto produto = buscarEntidade(id);
        produto.setDeletedAt(Instant.now());
    }

    @Override
    @Transactional
    public ProdutoResponse alterarStatus(Long id, StatusProduto status) {
        Produto produto = buscarEntidade(id);
        produto.setStatus(status);
        return toResponse(produto);
    }

    @Override
    @Transactional
    public ProdutoResponse duplicar(Long id) {
        Produto original = buscarEntidade(id);

        Produto copia = new Produto();
        copia.setNome(original.getNome());
        copia.setReferencia(gerarReferenciaDuplicada(original.getReferencia()));
        copia.setDescricao(original.getDescricao());
        copia.setCategoria(original.getCategoria());
        copia.setColecao(original.getColecao());
        copia.setTecido(original.getTecido());
        copia.setSexo(original.getSexo());
        copia.setPreco(original.getPreco());
        copia.setStatus(StatusProduto.INATIVO);
        copia.setObservacoes(original.getObservacoes());
        copia.setDestaque(false);
        copia.setLancamento(false);
        copia.setOrdem(proximaOrdem());
        copia.definirTamanhos(original.getProdutoTamanhos().stream()
                .filter(ProdutoTamanho::isDisponivel)
                .map(ProdutoTamanho::getTamanho)
                .toList());

        produtoRepository.save(copia);
        return toResponse(copia);
    }

    @Override
    @Transactional
    public void reordenar(List<ReordenarItemRequest> itens) {
        Map<Long, Produto> produtosPorId = produtoRepository.findAllById(itens.stream().map(ReordenarItemRequest::id).toList())
                .stream().collect(Collectors.toMap(Produto::getId, Function.identity()));

        for (ReordenarItemRequest item : itens) {
            Produto produto = produtosPorId.get(item.id());
            if (produto == null) {
                throw ResourceNotFoundException.of("Produto", item.id());
            }
            produto.setOrdem(item.ordem());
        }
    }

    @Override
    @Transactional
    public ProdutoResponse adicionarImagem(Long produtoId, ImagemProdutoRequest request) {
        Produto produto = buscarEntidade(produtoId);

        ImagemProduto imagem = new ImagemProduto();
        imagem.setUrl(request.url());
        imagem.setPublicId(request.publicId());
        imagem.setOrdem(proximaOrdemImagem(produto));
        imagem.setPrincipal(produto.getImagens().isEmpty());

        produto.adicionarImagem(imagem);
        return toResponse(produto);
    }

    @Override
    @Transactional
    public void removerImagem(Long produtoId, Long imagemId) {
        Produto produto = buscarEntidade(produtoId);
        ImagemProduto imagem = produto.getImagens().stream()
                .filter(img -> img.getId().equals(imagemId))
                .findFirst()
                .orElseThrow(() -> ResourceNotFoundException.of("Imagem", imagemId));

        boolean eraPrincipal = imagem.isPrincipal();
        cloudinaryService.excluirAsset(imagem.getPublicId(), "image");
        produto.removerImagem(imagem);

        if (eraPrincipal) {
            produto.getImagens().stream()
                    .min(Comparator.comparing(ImagemProduto::getOrdem))
                    .ifPresent(primeira -> primeira.setPrincipal(true));
        }
    }

    @Override
    @Transactional
    public ProdutoResponse marcarImagemPrincipal(Long produtoId, Long imagemId) {
        Produto produto = buscarEntidade(produtoId);
        boolean existe = produto.getImagens().stream().anyMatch(img -> img.getId().equals(imagemId));
        if (!existe) {
            throw ResourceNotFoundException.of("Imagem", imagemId);
        }
        produto.getImagens().forEach(img -> img.setPrincipal(img.getId().equals(imagemId)));
        return toResponse(produto);
    }

    @Override
    @Transactional
    public void reordenarImagens(Long produtoId, List<ReordenarItemRequest> itens) {
        Produto produto = buscarEntidade(produtoId);
        Map<Long, ImagemProduto> imagensPorId = produto.getImagens().stream()
                .collect(Collectors.toMap(ImagemProduto::getId, Function.identity()));

        for (ReordenarItemRequest item : itens) {
            ImagemProduto imagem = imagensPorId.get(item.id());
            if (imagem == null) {
                throw ResourceNotFoundException.of("Imagem", item.id());
            }
            imagem.setOrdem(item.ordem());
        }
    }

    @Override
    @Transactional
    public ProdutoResponse adicionarVideo(Long produtoId, VideoProdutoRequest request) {
        Produto produto = buscarEntidade(produtoId);

        VideoProduto video = new VideoProduto();
        video.setUrl(request.url());
        video.setPublicId(request.publicId());
        video.setOrdem(proximaOrdemVideo(produto));

        produto.adicionarVideo(video);
        return toResponse(produto);
    }

    @Override
    @Transactional
    public void removerVideo(Long produtoId, Long videoId) {
        Produto produto = buscarEntidade(produtoId);
        VideoProduto video = produto.getVideos().stream()
                .filter(v -> v.getId().equals(videoId))
                .findFirst()
                .orElseThrow(() -> ResourceNotFoundException.of("Vídeo", videoId));

        cloudinaryService.excluirAsset(video.getPublicId(), "video");
        produto.removerVideo(video);
    }

    // ---- helpers privados ----------------------------------------------------------------

    private Produto buscarEntidade(Long id) {
        return produtoRepository.findById(id)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", id));
    }

    private Categoria buscarCategoria(Long categoriaId) {
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> ResourceNotFoundException.of("Categoria", categoriaId));
    }

    private Colecao buscarColecaoOuNull(Long colecaoId) {
        if (colecaoId == null) {
            return null;
        }
        return colecaoRepository.findById(colecaoId)
                .orElseThrow(() -> ResourceNotFoundException.of("Coleção", colecaoId));
    }

    private List<Tamanho> buscarTamanhos(List<Long> tamanhoIds) {
        if (tamanhoIds == null || tamanhoIds.isEmpty()) {
            return List.of();
        }
        List<Tamanho> tamanhos = tamanhoRepository.findAllById(tamanhoIds);
        if (tamanhos.size() != new java.util.HashSet<>(tamanhoIds).size()) {
            throw new BusinessRuleException("Um ou mais tamanhos informados não existem.");
        }
        return tamanhos;
    }

    private void validarReferenciaUnica(String referencia, Long idParaIgnorar) {
        boolean emUso = idParaIgnorar == null
                ? produtoRepository.existsByReferencia(referencia)
                : produtoRepository.existsByReferenciaAndIdNot(referencia, idParaIgnorar);
        if (emUso) {
            throw new BusinessRuleException("Já existe um produto com a referência \"%s\".".formatted(referencia));
        }
    }

    private String gerarReferenciaDuplicada(String referenciaOriginal) {
        String base = referenciaOriginal + "-copia";
        String candidata = base;
        int sufixo = 2;
        while (produtoRepository.existsByReferencia(candidata)) {
            candidata = base + "-" + sufixo++;
        }
        return candidata;
    }

    private int proximaOrdem() {
        return produtoRepository.buscarMaiorOrdem() + 1;
    }

    private int proximaOrdemImagem(Produto produto) {
        return produto.getImagens().stream().mapToInt(ImagemProduto::getOrdem).max().orElse(-1) + 1;
    }

    private int proximaOrdemVideo(Produto produto) {
        return produto.getVideos().stream().mapToInt(VideoProduto::getOrdem).max().orElse(-1) + 1;
    }

    private ProdutoResponse toResponse(Produto produto) {
        List<TamanhoResumoResponse> tamanhos = produto.getProdutoTamanhos().stream()
                .filter(ProdutoTamanho::isDisponivel)
                .map(ProdutoTamanho::getTamanho)
                .sorted(Comparator.comparing(Tamanho::getOrdem))
                .map(t -> new TamanhoResumoResponse(t.getId(), t.getNome()))
                .toList();
        return produtoMapper.toResponse(produto, tamanhos);
    }

    private ProdutoSummaryResponse toSummary(Produto produto) {
        return produtoMapper.toSummary(produto, resolverImagemPrincipalUrl(produto));
    }

    private String resolverImagemPrincipalUrl(Produto produto) {
        return produto.getImagens().stream()
                .filter(ImagemProduto::isPrincipal)
                .findFirst()
                .or(() -> produto.getImagens().stream().min(Comparator.comparing(ImagemProduto::getOrdem)))
                .map(ImagemProduto::getUrl)
                .orElse(null);
    }
}
