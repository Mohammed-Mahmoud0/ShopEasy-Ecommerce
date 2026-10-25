package org.example.shopeasy.repo;

import org.example.shopeasy.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface OrderRepo extends JpaRepository<Order, Long> {
    Optional<Order> findByPublicId(String publicId);
    Page<Order> findByUserId(Long userId, Pageable pageable);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.publicId = :publicId")
    Optional<Order> lockByPublicId(@Param("publicId") String publicId);
}
