package org.example.shopeasy.model.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(@NotBlank @Size(max = 100) String name,
                              @NotBlank @Email @Size(max = 255) String email,
                              @NotBlank @Size(min = 8, max = 72) String password) { }
