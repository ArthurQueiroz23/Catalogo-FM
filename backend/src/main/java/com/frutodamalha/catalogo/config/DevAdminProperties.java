package com.frutodamalha.catalogo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Dados do usuário administrador criado automaticamente em ambiente de desenvolvimento,
 * apenas quando {@code enabled=true} e ainda não existir nenhum ADMIN no banco.
 * Nunca habilitado em produção (ver application-prod.yml) — o primeiro admin de produção
 * deve ser criado manualmente (ver docs/PROGRESS.md).
 */
@ConfigurationProperties(prefix = "app.dev-admin")
public record DevAdminProperties(boolean enabled, String nome, String email, String senha) {
}
