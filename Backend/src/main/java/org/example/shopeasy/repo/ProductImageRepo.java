package org.example.shopeasy.repo;

import org.example.shopeasy.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepo extends JpaRepository<ProductImage, Long> { }
