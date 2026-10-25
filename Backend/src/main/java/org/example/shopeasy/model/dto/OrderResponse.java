package org.example.shopeasy.model.dto;

import org.example.shopeasy.model.Order;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(String id, String status, Instant createdAt, BigDecimal total,
                            List<OrderItemResponse> items) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getPublicId(), order.getStatus().name(), order.getCreatedAt(),
                order.getTotal(), order.getItems().stream().map(i -> new OrderItemResponse(
                        i.getProduct().getId(), i.getProductName(), i.getQuantity(),
                        i.getUnitPrice(), i.getLineTotal())).toList());
    }
}
