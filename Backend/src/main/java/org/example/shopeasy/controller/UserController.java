package org.example.shopeasy.controller;

import org.example.shopeasy.exception.ApiException;
import org.example.shopeasy.model.dto.UserResponse;
import org.example.shopeasy.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepo users;

    public UserController(UserRepo users) { this.users = users; }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return users.findById(Long.valueOf(jwt.getSubject()))
                .map(UserResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
