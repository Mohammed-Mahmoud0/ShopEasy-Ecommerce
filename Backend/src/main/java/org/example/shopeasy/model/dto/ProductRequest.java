package org.example.shopeasy.model.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 2000) String description,
        @NotBlank @Size(max = 100) String brand,
        @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal price,
        @NotBlank @Size(max = 100) String category,
        @NotNull @Min(0) Integer stockQuantity,
        @NotNull Boolean active) { }
