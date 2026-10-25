package org.example.shopeasy.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(nullable = false, length = 2000)
    private String description;
    @Column(nullable = false, length = 100)
    private String brand;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
    @Column(nullable = false, length = 100)
    private String category;
    @Column(nullable = false)
    private int stockQuantity;
    @Column(nullable = false)
    private boolean active = true;
}
