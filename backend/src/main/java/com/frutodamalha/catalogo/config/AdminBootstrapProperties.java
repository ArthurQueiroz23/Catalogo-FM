package com.frutodamalha.catalogo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Dados do primeiro usuário ADMIN, criado na subida da aplicação apenas quando
 * {@code enabled=true} e o banco ainda não tem nenhum usuário.
 *
 * <p>Em desenvolvimento os valores vêm de {@code application-dev.yml} (credenciais fracas
 * conhecidas, documentadas no README). Em produção vêm de variáveis de ambiente e são validadas
 * com rigor — ver {@link AdminBootstrapInitializer} e {@code docs/DEPLOY.md}.
 */
@ConfigurationProperties(prefix = "app.admin-bootstrap")
public record AdminBootstrapProperties(boolean enabled, String nome, String email, String senha) {
}
