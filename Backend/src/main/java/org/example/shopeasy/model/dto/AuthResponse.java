package org.example.shopeasy.model.dto;

public record AuthResponse(String accessToken, String tokenType, long expiresInSeconds) { }
