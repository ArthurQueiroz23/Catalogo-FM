package com.frutodamalha.catalogo.service;

import com.frutodamalha.catalogo.dto.request.LoginRequest;
import com.frutodamalha.catalogo.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse autenticar(LoginRequest request);
}
