package com.frutodamalha.catalogo.controller;

import com.frutodamalha.catalogo.dto.response.DashboardResponse;
import com.frutodamalha.catalogo.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Resumo do catálogo para a tela inicial do painel")
    public ResponseEntity<DashboardResponse> obterResumo() {
        return ResponseEntity.ok(dashboardService.obterResumo());
    }
}
