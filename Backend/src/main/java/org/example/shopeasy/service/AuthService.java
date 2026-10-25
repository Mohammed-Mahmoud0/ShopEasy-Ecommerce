package org.example.shopeasy.service;

import org.example.shopeasy.exception.ApiException;
import org.example.shopeasy.model.AppUser;
import org.example.shopeasy.model.Role;
import org.example.shopeasy.model.dto.AuthResponse;
import org.example.shopeasy.model.dto.LoginRequest;
import org.example.shopeasy.model.dto.RegisterRequest;
import org.example.shopeasy.repo.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Locale;

@Service
public class AuthService {
    private final UserRepo users;
    private final PasswordEncoder passwords;
    private final JwtEncoder encoder;
    private final String issuer;
    private final long ttlMinutes;

    public AuthService(UserRepo users, PasswordEncoder passwords, JwtEncoder encoder,
                       @Value("${app.jwt.issuer}") String issuer,
                       @Value("${app.jwt.ttl-minutes}") long ttlMinutes) {
        this.users = users;
        this.passwords = passwords;
        this.encoder = encoder;
        this.issuer = issuer;
        this.ttlMinutes = ttlMinutes;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        AppUser user = new AppUser();
        user.setEmail(email);
        user.setName(request.name().trim());
        user.setPasswordHash(passwords.encode(request.password()));
        user.setRole(Role.CUSTOMER);
        return token(users.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = users.findByEmail(request.email().trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!passwords.matches(request.password(), user.getPasswordHash()))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        return token(user);
    }

    private AuthResponse token(AppUser user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer(issuer).issuedAt(now)
                .expiresAt(now.plusSeconds(ttlMinutes * 60)).subject(user.getId().toString())
                .claim("role", user.getRole().name()).build();
        String value = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(value, "Bearer", ttlMinutes * 60);
    }
}
