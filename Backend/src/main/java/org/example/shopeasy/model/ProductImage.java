package org.example.shopeasy.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_images")
@Getter @Setter @NoArgsConstructor
public class ProductImage {
    @Id
    private Long productId;
    @OneToOne(fetch = FetchType.LAZY) @MapsId @JoinColumn(name = "product_id")
    private Product product;
    @Column(nullable = false, length = 50)
    private String contentType;
    @JdbcTypeCode(SqlTypes.VARBINARY) @Column(nullable = false, length = 2_000_000)
    private byte[] data;
}
