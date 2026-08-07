package com.frutodamalha.catalogo.config;

import com.frutodamalha.catalogo.domain.entity.Usuario;
import com.frutodamalha.catalogo.domain.enums.Role;
import com.frutodamalha.catalogo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Cria o primeiro usuário ADMIN do sistema.
 *
 * <p>Existe porque o schema nasce vazio: sem isso, um deploy novo sobe com o banco sem nenhum
 * usuário e <b>o login fica impossível</b> — não há tela de cadastro, por design (o painel é de
 * uso exclusivo da administradora da loja).
 *
 * <p>Regras, nesta ordem:
 * <ol>
 *   <li>só age se {@code app.admin-bootstrap.enabled=true};</li>
 *   <li>só age se o banco não tiver <b>nenhum</b> usuário — nunca sobrescreve nem redefine a senha
 *       de um admin existente, então deixar a variável ligada por engano não reabre uma porta;</li>
 *   <li>fora do perfil {@code dev}, exige senha de no mínimo {@value #TAMANHO_MINIMO_SENHA}
 *       caracteres e <b>derruba a aplicação</b> se for mais curta. É proposital: é preferível o
 *       deploy falhar de forma visível a subir um painel de produção com uma senha adivinhável.</li>
 * </ol>
 *
 * <p>Depois do primeiro login, remova as variáveis de ambiente do painel da hospedagem — elas não
 * são mais necessárias e guardam a senha em texto puro. Ver {@code docs/DEPLOY.md}.
 */
@Component
@RequiredArgsConstructor
public class AdminBootstrapInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapInitializer.class);

    /** Mínimo exigido fora de desenvolvimento. */
    private static final int TAMANHO_MINIMO_SENHA = 12;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminBootstrapProperties propriedades;
    private final Environment environment;

    @Override
    public void run(ApplicationArguments args) {
        if (!propriedades.enabled()) {
            return;
        }

        boolean desenvolvimento = environment.matchesProfiles("dev");

        if (!StringUtils.hasText(propriedades.email()) || !StringUtils.hasText(propriedades.senha())) {
            throw new IllegalStateException("""
                    app.admin-bootstrap.enabled=true, mas o e-mail e/ou a senha do primeiro \
                    administrador não foram informados. Configure as variáveis de ambiente \
                    APP_ADMIN_BOOTSTRAP_EMAIL e APP_ADMIN_BOOTSTRAP_SENHA, ou desligue o bootstrap \
                    com APP_ADMIN_BOOTSTRAP_ENABLED=false.""");
        }

        if (!desenvolvimento && propriedades.senha().length() < TAMANHO_MINIMO_SENHA) {
            throw new IllegalStateException(
                    "A senha do primeiro administrador precisa ter pelo menos " + TAMANHO_MINIMO_SENHA
                            + " caracteres fora do ambiente de desenvolvimento. Gere uma senha forte "
                            + "e configure APP_ADMIN_BOOTSTRAP_SENHA novamente.");
        }

        if (usuarioRepository.count() > 0) {
            log.info("Bootstrap de administrador ignorado: já existe usuário cadastrado. "
                    + "Remova APP_ADMIN_BOOTSTRAP_* das variáveis de ambiente.");
            return;
        }

        Usuario admin = new Usuario();
        admin.setNome(StringUtils.hasText(propriedades.nome()) ? propriedades.nome() : "Administradora");
        admin.setEmail(propriedades.email().trim().toLowerCase());
        admin.setSenhaHash(passwordEncoder.encode(propriedades.senha()));
        admin.setRole(Role.ADMIN);
        admin.setAtivo(true);
        usuarioRepository.save(admin);

        if (desenvolvimento) {
            log.warn("Administrador de desenvolvimento criado: {} (senha do application-dev.yml).",
                    admin.getEmail());
        } else {
            log.warn("""

                    ============================================================================
                    PRIMEIRO ADMINISTRADOR CRIADO: {}
                    Faça login no painel e, em seguida, REMOVA as variáveis de ambiente
                    APP_ADMIN_BOOTSTRAP_ENABLED, APP_ADMIN_BOOTSTRAP_EMAIL e
                    APP_ADMIN_BOOTSTRAP_SENHA do painel da hospedagem — elas guardam a senha
                    em texto puro e não têm mais utilidade.
                    ============================================================================
                    """, admin.getEmail());
        }
    }
}
