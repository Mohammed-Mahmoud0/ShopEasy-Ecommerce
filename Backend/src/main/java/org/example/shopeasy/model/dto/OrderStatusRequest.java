package org.example.shopeasy.model.dto;

import jakarta.validation.constraints.NotNull;
import org.example.shopeasy.model.OrderStatus;

public record OrderStatusRequest(@NotNull OrderStatus status) { }
