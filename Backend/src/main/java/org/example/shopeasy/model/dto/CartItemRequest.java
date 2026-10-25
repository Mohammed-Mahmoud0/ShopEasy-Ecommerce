package org.example.shopeasy.model.dto;

import jakarta.validation.constraints.*;

public record CartItemRequest(@NotNull Long productId, @NotNull @Min(1) @Max(1000) Integer quantity) { }
