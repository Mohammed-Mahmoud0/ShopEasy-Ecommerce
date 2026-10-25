package org.example.shopeasy.model.dto;

import org.example.shopeasy.model.Product;
import java.math.BigDecimal;

public record ProductResponse(Long id, String name, String description, String brand,
                              BigDecimal price, String category, int stockQuantity, boolean active,
                              String imageUrl) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getBrand(),
                p.getPrice(), p.getCategory(), p.getStockQuantity(), p.isActive(),
                "/api/products/" + p.getId() + "/image");
    }
}
