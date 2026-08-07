package com.frutodamalha.catalogo.config;

import com.frutodamalha.catalogo.security.JwtAccessDeniedHandler;
import com.frutodamalha.catalogo.security.JwtAuthenticationEntryPoint;
import com.frutodamalha.catalogo.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuração central de segurança: API stateless autenticada via JWT (ver
 * docs/ARCHITECTURE.md §2.7). Endpoints de leitura do catálogo são públicos; tudo sob
 * {@code /admin/**} exige {@code ROLE_ADMIN}.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final CorsProperties corsProperties;

    // O caminho do JSON do OpenAPI é customizado via springdoc.api-docs.path=/api-docs
    // (application.yml) — não é o padrão /v3/api-docs do springdoc.
    private static final String[] DOCS_PATHS = {
            "/swagger-ui.html", "/swagger-ui/**", "/api-docs", "/api-docs/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(DOCS_PATHS).permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categorias/**", "/colecoes/**", "/tamanhos/**", "/produtos/**").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origens = corsProperties.allowedOrigins();

        if (origens == null || origens.isEmpty()) {
            throw new IllegalStateException(
                    "APP_CORS_ALLOWED_ORIGINS não foi configurado. Informe a origem do frontend "
                            + "(ex.: https://catalogo-fm.vercel.app), separando por vírgula se houver mais de uma.");
        }
        if (origens.contains("*")) {
            throw new IllegalStateException(
                    "APP_CORS_ALLOWED_ORIGINS não pode ser \"*\": a API usa credenciais (JWT) e liberar "
                            + "qualquer origem permitiria que qualquer site chamasse os endpoints do painel. "
                            + "Liste as origens explicitamente.");
        }

        CorsConfiguration configuration = new CorsConfiguration();
        // setAllowedOriginPatterns (e não setAllowedOrigins) porque os deploys de preview da Vercel
        // recebem um subdomínio novo a cada push — sem curinga, cada preview quebraria no CORS.
        // Continua sendo uma lista explícita: o "*" puro é rejeitado acima.
        configuration.setAllowedOriginPatterns(origens.stream().map(String::trim).toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }
}
