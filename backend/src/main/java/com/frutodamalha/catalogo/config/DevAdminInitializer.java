package com.frutodamalha.catalogo.config;

import com.frutodamalha.catalogo.domain.entity.Usuario;
import com.frutodamalha.catalogo.domain.enums.Role;
import com.frutodamalha.catalogo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Cria um usuário ADMIN padrão em ambiente de desenvolvimento, apenas se {@code app.dev-admin.enabled=true}
 * (ligado em application-dev.yml, desligado em application-prod.yml) e ainda não existir nenhum
 * usuário cadastrado. Nunca roda em produção — o primeiro admin de produção deve ser criado
 * manualmente (ver docs/PROGRESS.md, seção "Criação do primeiro usuário admin em produção").
 */
@Component
@RequiredArgsConstructor
public class DevAdminInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevAdminInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final DevAdminProperties devAdminProperties;

    @Override
    public void run(ApplicationArguments args) {
        if (!devAdminProperties.enabled()) {
            return;
        }
        if (usuarioRepository.count() > 0) {
            return;
        }

        Usuario admin = new Usuario();
        admin.setNome(devAdminProperties.nome());
        admin.setEmail(devAdminProperties.email());
        admin.setSenhaHash(passwordEncoder.encode(devAdminProperties.senha()));
        admin.setRole(Role.ADMIN);
        admin.setAtivo(true);
        usuarioRepository.save(admin);

        log.warn("Usuário admin de desenvolvimento criado: {} / senha padrão do application-dev.yml — troque antes de ir para produção.",
                devAdminProperties.email());
    }
}
