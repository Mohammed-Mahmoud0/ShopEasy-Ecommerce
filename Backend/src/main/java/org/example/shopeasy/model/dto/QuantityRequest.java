package org.example.shopeasy.model.dto;

import jakarta.validation.constraints.*;

public record QuantityRequest(@NotNull @Min(1) @Max(1000) Integer quantity) { }
