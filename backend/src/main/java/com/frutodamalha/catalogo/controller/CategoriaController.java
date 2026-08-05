package com.frutodamalha.catalogo.controller;

import com.frutodamalha.catalogo.dto.request.CategoriaRequest;
import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.response.CategoriaResponse;
import com.frutodamalha.catalogo.service.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping("/categorias")
    @Operation(summary = "Lista categorias ativas, ordenadas para exibição pública")
    public ResponseEntity<List<CategoriaResponse>> listarPublico() {
        return ResponseEntity.ok(categoriaService.listarPublico());
    }

    @GetMapping("/categorias/{slug}")
    @Operation(summary = "Detalhe de uma categoria pelo slug")
    public ResponseEntity<CategoriaResponse> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoriaService.buscarPorSlug(slug));
    }

    @GetMapping("/admin/categorias")
    @Operation(summary = "Lista todas as categorias (inclusive inativas) para o painel")
    public ResponseEntity<List<CategoriaResponse>> listarAdmin() {
        return ResponseEntity.ok(categoriaService.listarAdmin());
    }

    @GetMapping("/admin/categorias/{id}")
    @Operation(summary = "Detalhe de uma categoria por id, para edição no painel")
    public ResponseEntity<CategoriaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.buscarPorId(id));
    }

    @PostMapping("/admin/categorias")
    @Operation(summary = "Cria uma nova categoria")
    public ResponseEntity<CategoriaResponse> criar(@Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.criar(request));
    }

    @PutMapping("/admin/categorias/{id}")
    @Operation(summary = "Edita uma categoria existente")
    public ResponseEntity<CategoriaResponse> atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.ok(categoriaService.atualizar(id, request));
    }

    @DeleteMapping("/admin/categorias/{id}")
    @Operation(summary = "Exclui uma categoria (bloqueado se houver produtos vinculados)")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        categoriaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/categorias/reordenar")
    @Operation(summary = "Atualiza a ordem de exibição das categorias (drag-and-drop)")
    public ResponseEntity<Void> reordenar(@Valid @RequestBody List<ReordenarItemRequest> itens) {
        categoriaService.reordenar(itens);
        return ResponseEntity.noContent().build();
    }
}
