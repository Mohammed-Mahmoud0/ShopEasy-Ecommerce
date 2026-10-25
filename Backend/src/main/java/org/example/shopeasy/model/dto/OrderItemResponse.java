package org.example.shopeasy.model.dto;

import java.math.BigDecimal;

public record OrderItemResponse(Long productId, String productName, int quantity,
                                BigDecimal unitPrice, BigDecimal lineTotal) { }
