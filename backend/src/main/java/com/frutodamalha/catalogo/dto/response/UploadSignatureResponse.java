package com.frutodamalha.catalogo.dto.response;

public record UploadSignatureResponse(
        String signature,
        long timestamp,
        String apiKey,
        String cloudName,
        String folder
) {
}
