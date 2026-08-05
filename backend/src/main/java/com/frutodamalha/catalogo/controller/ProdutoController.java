package com.frutodamalha.catalogo.controller;

import com.frutodamalha.catalogo.domain.enums.Sexo;
import com.frutodamalha.catalogo.domain.enums.StatusProduto;
import com.frutodamalha.catalogo.dto.common.PageResponse;
import com.frutodamalha.catalogo.dto.request.AlterarStatusProdutoRequest;
import com.frutodamalha.catalogo.dto.request.ImagemProdutoRequest;
import com.frutodamalha.catalogo.dto.request.ProdutoFiltro;
import com.frutodamalha.catalogo.dto.request.ProdutoRequest;
import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.request.VideoProdutoRequest;
import com.frutodamalha.catalogo.dto.response.ProdutoResponse;
import com.frutodamalha.catalogo.dto.response.ProdutoSummaryResponse;
import com.frutodamalha.catalogo.service.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    // ---- Público -----------------------------------------------------------------------

    @GetMapping("/produtos")
    @Operation(summary = "Lista produtos ativos com busca e filtros")
    public ResponseEntity<PageResponse<ProdutoSummaryResponse>> listarPublico(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String colecao,
            @RequestParam(required = false) Sexo sexo,
            @PageableDefault(sort = "ordem", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        var filtro = ProdutoFiltro.publico(q, categoria, colecao, sexo);
        return ResponseEntity.ok(produtoService.listar(filtro, pageable));
    }

    @GetMapping("/produtos/destaques")
    @Operation(summary = "Produtos marcados como destaque")
    public ResponseEntity<List<ProdutoSummaryResponse>> listarDestaques() {
        return ResponseEntity.ok(produtoService.listarDestaques());
    }

    @GetMapping("/produtos/lancamentos")
    @Operation(summary = "Produtos marcados como lançamento")
    public ResponseEntity<List<ProdutoSummaryResponse>> listarLancamentos() {
        return ResponseEntity.ok(produtoService.listarLancamentos());
    }

    @GetMapping("/produtos/{referencia}")
    @Operation(summary = "Detalhe completo de um produto pela referência")
    public ResponseEntity<ProdutoResponse> buscarPorReferencia(@PathVariable String referencia) {
        return ResponseEntity.ok(produtoService.buscarPorReferencia(referencia));
    }

    // ---- Administração ------------------------------------------------------------------

    @GetMapping("/admin/produtos")
    @Operation(summary = "Lista produtos para o painel, com filtros e busca")
    public ResponseEntity<PageResponse<ProdutoSummaryResponse>> listarAdmin(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String colecao,
            @RequestParam(required = false) Sexo sexo,
            @RequestParam(required = false) StatusProduto status,
            @RequestParam(defaultValue = "false") boolean incluirExcluidos,
            @PageableDefault(sort = "ordem", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        var filtro = ProdutoFiltro.admin(q, categoria, colecao, sexo, status, incluirExcluidos);
        return ResponseEntity.ok(produtoService.listar(filtro, pageable));
    }

    @GetMapping("/admin/produtos/{id}")
    @Operation(summary = "Detalhe de um produto por id, para edição no painel")
    public ResponseEntity<ProdutoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PostMapping("/admin/produtos")
    @Operation(summary = "Cria um novo produto")
    public ResponseEntity<ProdutoResponse> criar(@Valid @RequestBody ProdutoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.criar(request));
    }

    @PutMapping("/admin/produtos/{id}")
    @Operation(summary = "Edita um produto existente")
    public ResponseEntity<ProdutoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoRequest request) {
        return ResponseEntity.ok(produtoService.atualizar(id, request));
    }

    @DeleteMapping("/admin/produtos/{id}")
    @Operation(summary = "Exclui um produto (soft delete)")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        produtoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/produtos/{id}/status")
    @Operation(summary = "Ativa ou oculta um produto")
    public ResponseEntity<ProdutoResponse> alterarStatus(@PathVariable Long id, @Valid @RequestBody AlterarStatusProdutoRequest request) {
        return ResponseEntity.ok(produtoService.alterarStatus(id, request.status()));
    }

    @PostMapping("/admin/produtos/{id}/duplicar")
    @Operation(summary = "Duplica um produto (nova referência, status inativo, sem galeria)")
    public ResponseEntity<ProdutoResponse> duplicar(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.duplicar(id));
    }

    @PatchMapping("/admin/produtos/reordenar")
    @Operation(summary = "Atualiza a ordem de exibição dos produtos (drag-and-drop)")
    public ResponseEntity<Void> reordenar(@Valid @RequestBody List<ReordenarItemRequest> itens) {
        produtoService.reordenar(itens);
        return ResponseEntity.noContent().build();
    }

    // ---- Galeria (imagens/vídeos) --------------------------------------------------------

    @PostMapping("/admin/produtos/{id}/imagens")
    @Operation(summary = "Adiciona uma imagem à galeria do produto")
    public ResponseEntity<ProdutoResponse> adicionarImagem(@PathVariable Long id, @Valid @RequestBody ImagemProdutoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.adicionarImagem(id, request));
    }

    @DeleteMapping("/admin/produtos/{produtoId}/imagens/{imagemId}")
    @Operation(summary = "Remove uma imagem da galeria (e do Cloudinary)")
    public ResponseEntity<Void> removerImagem(@PathVariable Long produtoId, @PathVariable Long imagemId) {
        produtoService.removerImagem(produtoId, imagemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/produtos/{produtoId}/imagens/{imagemId}/principal")
    @Operation(summary = "Marca uma imagem como principal (capa)")
    public ResponseEntity<ProdutoResponse> marcarImagemPrincipal(@PathVariable Long produtoId, @PathVariable Long imagemId) {
        return ResponseEntity.ok(produtoService.marcarImagemPrincipal(produtoId, imagemId));
    }

    @PatchMapping("/admin/produtos/{produtoId}/imagens/reordenar")
    @Operation(summary = "Reordena a galeria de imagens do produto")
    public ResponseEntity<Void> reordenarImagens(@PathVariable Long produtoId, @Valid @RequestBody List<ReordenarItemRequest> itens) {
        produtoService.reordenarImagens(produtoId, itens);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/produtos/{id}/videos")
    @Operation(summary = "Adiciona um vídeo à galeria do produto")
    public ResponseEntity<ProdutoResponse> adicionarVideo(@PathVariable Long id, @Valid @RequestBody VideoProdutoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoService.adicionarVideo(id, request));
    }

    @DeleteMapping("/admin/produtos/{produtoId}/videos/{videoId}")
    @Operation(summary = "Remove um vídeo da galeria (e do Cloudinary)")
    public ResponseEntity<Void> removerVideo(@PathVariable Long produtoId, @PathVariable Long videoId) {
        produtoService.removerVideo(produtoId, videoId);
        return ResponseEntity.noContent().build();
    }
}
