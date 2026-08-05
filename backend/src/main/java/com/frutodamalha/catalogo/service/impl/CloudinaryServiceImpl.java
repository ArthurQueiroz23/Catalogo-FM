package com.frutodamalha.catalogo.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.frutodamalha.catalogo.config.CloudinaryProperties;
import com.frutodamalha.catalogo.dto.response.UploadSignatureResponse;
import com.frutodamalha.catalogo.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryServiceImpl.class);

    private final Cloudinary cloudinary;
    private final CloudinaryProperties properties;

    @Override
    public UploadSignatureResponse gerarAssinaturaUpload(String pasta) {
        long timestamp = System.currentTimeMillis() / 1000;
        String folder = properties.baseFolder() + "/" + pasta;

        Map<String, Object> paramsToSign = ObjectUtils.asMap(
                "timestamp", timestamp,
                "folder", folder
        );
        String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

        return new UploadSignatureResponse(signature, timestamp, cloudinary.config.apiKey, cloudinary.config.cloudName, folder);
    }

    @Override
    public void excluirAsset(String publicId, String resourceType) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
        } catch (IOException ex) {
            // Best-effort: uma falha ao remover o asset remoto não deve impedir a administradora
            // de remover a mídia do produto. O asset fica órfão no Cloudinary (custo de storage
            // residual, sem impacto funcional) — logado para limpeza manual posterior se necessário.
            log.warn("Falha ao excluir asset {} ({}) no Cloudinary: {}", publicId, resourceType, ex.getMessage());
        }
    }
}
