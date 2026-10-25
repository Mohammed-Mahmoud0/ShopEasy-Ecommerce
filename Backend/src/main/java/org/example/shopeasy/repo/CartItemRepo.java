package org.example.shopeasy.repo;

import org.example.shopeasy.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    @EntityGraph(attributePaths = "product")
    List<CartItem> findByUserIdOrderByProductIdAsc(Long userId);
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    void deleteByUserId(Long userId);
}
