package org.example.shopeasy.controller;

import jakarta.validation.Valid;
import org.example.shopeasy.model.dto.*;
import org.example.shopeasy.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(request));
    }
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) { return auth.login(request); }
}
