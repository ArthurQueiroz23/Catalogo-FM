package com.frutodamalha.catalogo.security;

import com.frutodamalha.catalogo.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

/**
 * Emissão e validação de JWT stateless. O token carrega apenas o e-mail do usuário (subject) e
 * o papel (claim {@code role}) — nenhum dado sensível além disso. Ver docs/ARCHITECTURE.md §2.7.
 */
@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(String email, String role) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + properties.expirationMs());

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuer(properties.issuer())
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(signingKey)
                .compact();
    }

    public long expiracaoEmMs() {
        return properties.expirationMs();
    }

    public Optional<String> extrairEmail(String token) {
        return extrairClaims(token).map(Claims::getSubject);
    }

    public boolean tokenValido(String token, String email) {
        return extrairEmail(token)
                .map(subject -> subject.equalsIgnoreCase(email))
                .orElse(false);
    }

    private Optional<Claims> extrairClaims(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
