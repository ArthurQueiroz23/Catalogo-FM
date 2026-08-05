package com.frutodamalha.catalogo.controller;

import com.frutodamalha.catalogo.dto.request.ReordenarItemRequest;
import com.frutodamalha.catalogo.dto.request.TamanhoRequest;
import com.frutodamalha.catalogo.dto.response.TamanhoResponse;
import com.frutodamalha.catalogo.service.TamanhoService;
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
@Tag(name = "Tamanhos")
public class TamanhoController {

    private final TamanhoService tamanhoService;

    @GetMapping("/tamanhos")
    @Operation(summary = "Lista tamanhos ativos, ordenados para exibição pública")
    public ResponseEntity<List<TamanhoResponse>> listarPublico() {
        return ResponseEntity.ok(tamanhoService.listarPublico());
    }

    @GetMapping("/admin/tamanhos")
    @Operation(summary = "Lista todos os tamanhos para o painel")
    public ResponseEntity<List<TamanhoResponse>> listarAdmin() {
        return ResponseEntity.ok(tamanhoService.listarAdmin());
    }

    @PostMapping("/admin/tamanhos")
    @Operation(summary = "Cria um novo tamanho")
    public ResponseEntity<TamanhoResponse> criar(@Valid @RequestBody TamanhoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tamanhoService.criar(request));
    }

    @PutMapping("/admin/tamanhos/{id}")
    @Operation(summary = "Edita um tamanho existente")
    public ResponseEntity<TamanhoResponse> atualizar(@PathVariable Long id, @Valid @RequestBody TamanhoRequest request) {
        return ResponseEntity.ok(tamanhoService.atualizar(id, request));
    }

    @DeleteMapping("/admin/tamanhos/{id}")
    @Operation(summary = "Exclui um tamanho (bloqueado se algum produto o utilizar)")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        tamanhoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/tamanhos/reordenar")
    @Operation(summary = "Atualiza a ordem de exibição dos tamanhos")
    public ResponseEntity<Void> reordenar(@Valid @RequestBody List<ReordenarItemRequest> itens) {
        tamanhoService.reordenar(itens);
        return ResponseEntity.noContent().build();
    }
}
