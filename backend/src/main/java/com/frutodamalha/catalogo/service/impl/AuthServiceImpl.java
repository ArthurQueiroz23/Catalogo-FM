package com.frutodamalha.catalogo.service.impl;

import com.frutodamalha.catalogo.domain.entity.Usuario;
import com.frutodamalha.catalogo.dto.request.LoginRequest;
import com.frutodamalha.catalogo.dto.response.LoginResponse;
import com.frutodamalha.catalogo.dto.response.UsuarioResponse;
import com.frutodamalha.catalogo.security.JwtService;
import com.frutodamalha.catalogo.security.UsuarioPrincipal;
import com.frutodamalha.catalogo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public LoginResponse autenticar(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );

        Usuario usuario = ((UsuarioPrincipal) authentication.getPrincipal()).getUsuario();
        String token = jwtService.gerarToken(usuario.getEmail(), usuario.getRole().name());

        var usuarioResponse = new UsuarioResponse(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getRole().name());
        return LoginResponse.of(token, jwtService.expiracaoEmMs(), usuarioResponse);
    }
}
