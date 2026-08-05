package com.frutodamalha.catalogo.controller;

import com.frutodamalha.catalogo.dto.request.UploadSignatureRequest;
import com.frutodamalha.catalogo.dto.response.UploadSignatureResponse;
import com.frutodamalha.catalogo.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/uploads")
@RequiredArgsConstructor
@Tag(name = "Uploads", description = "Assinatura para upload direto de mídia ao Cloudinary")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/signature")
    @Operation(summary = "Gera uma assinatura de upload para o Cloudinary (o backend nunca recebe o arquivo)")
    public ResponseEntity<UploadSignatureResponse> gerarAssinatura(@Valid @RequestBody UploadSignatureRequest request) {
        return ResponseEntity.ok(cloudinaryService.gerarAssinaturaUpload(request.folder()));
    }
}
