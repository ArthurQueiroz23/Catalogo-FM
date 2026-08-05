package com.frutodamalha.catalogo.controller;

import com.frutodamalha.catalogo.dto.request.ColecaoRequest;
import com.frutodamalha.catalogo.dto.response.ColecaoResponse;
import com.frutodamalha.catalogo.service.ColecaoService;
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
@Tag(name = "Coleções")
public class ColecaoController {

    private final ColecaoService colecaoService;

    @GetMapping("/colecoes")
    @Operation(summary = "Lista coleções ativas")
    public ResponseEntity<List<ColecaoResponse>> listarPublico() {
        return ResponseEntity.ok(colecaoService.listarPublico());
    }

    @GetMapping("/colecoes/{slug}")
    @Operation(summary = "Detalhe de uma coleção pelo slug")
    public ResponseEntity<ColecaoResponse> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(colecaoService.buscarPorSlug(slug));
    }

    @GetMapping("/admin/colecoes")
    @Operation(summary = "Lista todas as coleções para o painel")
    public ResponseEntity<List<ColecaoResponse>> listarAdmin() {
        return ResponseEntity.ok(colecaoService.listarAdmin());
    }

    @GetMapping("/admin/colecoes/{id}")
    @Operation(summary = "Detalhe de uma coleção por id, para edição no painel")
    public ResponseEntity<ColecaoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(colecaoService.buscarPorId(id));
    }

    @PostMapping("/admin/colecoes")
    @Operation(summary = "Cria uma nova coleção")
    public ResponseEntity<ColecaoResponse> criar(@Valid @RequestBody ColecaoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(colecaoService.criar(request));
    }

    @PutMapping("/admin/colecoes/{id}")
    @Operation(summary = "Edita uma coleção existente")
    public ResponseEntity<ColecaoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody ColecaoRequest request) {
        return ResponseEntity.ok(colecaoService.atualizar(id, request));
    }

    @DeleteMapping("/admin/colecoes/{id}")
    @Operation(summary = "Exclui uma coleção (bloqueado se houver produtos vinculados)")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        colecaoService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
