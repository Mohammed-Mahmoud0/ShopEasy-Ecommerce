package org.example.shopeasy.config;

import org.example.shopeasy.model.AppUser;
import org.example.shopeasy.model.Role;
import org.example.shopeasy.model.dto.RegisterRequest;
import org.example.shopeasy.repo.UserRepo;
import org.example.shopeasy.service.AuthService;
import org.junit.jupiter.api.Test;
import java.util.Base64;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JwtAuthTest {
    @Test
    void registrationCreatesCustomerAndIssuesVerifiableToken() {
        SecurityConfig config = new SecurityConfig();
        var key = config.jwtKey(Base64.getEncoder().encodeToString(new byte[32]));
        UserRepo users = mock(UserRepo.class);
        when(users.save(any(AppUser.class))).thenAnswer(call -> {
            AppUser user = call.getArgument(0);
            user.setId(42L);
            return user;
        });
        AuthService auth = new AuthService(users, config.passwordEncoder(), config.jwtEncoder(key), "http://localhost:8080", 60);

        var response = auth.register(new RegisterRequest("Alex", "ALEX@example.com", "strong-password-123"));
        var jwt = config.jwtDecoder(key, "http://localhost:8080").decode(response.accessToken());

        assertEquals("42", jwt.getSubject());
        assertEquals("CUSTOMER", jwt.getClaimAsString("role"));
        assertEquals("http://localhost:8080", jwt.getIssuer().toString());
        verify(users).save(argThat(user -> user.getRole() == Role.CUSTOMER &&
                user.getEmail().equals("alex@example.com") && !user.getPasswordHash().equals("strong-password-123")));
    }
}
