package com.frutodamalha.catalogo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Extrai o JWT do header {@code Authorization: Bearer ...}, valida e popula o
 * {@link SecurityContextHolder} para a requisição atual. Stateless: nenhuma sessão é criada
 * (ver {@code SecurityConfig}, que define {@code SessionCreationPolicy.STATELESS}).
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        Optional<String> token = extrairToken(request);
        token.flatMap(jwtService::extrairEmail)
                .ifPresent(email -> autenticarSeNecessario(email, token.get()));

        filterChain.doFilter(request, response);
    }

    private void autenticarSeNecessario(String email, String token) {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }
        if (!jwtService.tokenValido(token, email)) {
            return;
        }

        UserDetails userDetails;
        try {
            // Cobre o caso raro de um token ainda válido para um usuário já excluído do banco —
            // sem isso, a requisição falharia com 500 em vez de simplesmente seguir não autenticada.
            userDetails = userDetailsService.loadUserByUsername(email);
        } catch (UsernameNotFoundException ex) {
            return;
        }
        if (!userDetails.isEnabled()) {
            return;
        }

        var authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private Optional<String> extrairToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return Optional.of(header.substring(BEARER_PREFIX.length()));
        }
        return Optional.empty();
    }
}
