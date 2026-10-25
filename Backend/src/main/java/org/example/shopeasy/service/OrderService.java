package org.example.shopeasy.service;

import org.example.shopeasy.exception.ApiException;
import org.example.shopeasy.model.*;
import org.example.shopeasy.model.dto.OrderResponse;
import org.example.shopeasy.repo.CartItemRepo;
import org.example.shopeasy.repo.OrderRepo;
import org.example.shopeasy.repo.ProductRepo;
import org.example.shopeasy.repo.UserRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepo orders;
    private final CartItemRepo cart;
    private final ProductRepo products;
    private final UserRepo users;

    public OrderService(OrderRepo orders, CartItemRepo cart, ProductRepo products, UserRepo users) {
        this.orders = orders;
        this.cart = cart;
        this.products = products;
        this.users = users;
    }

    @Transactional
    public OrderResponse checkout(Long userId) {
        AppUser user = users.lockById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        List<CartItem> rows = cart.findByUserIdOrderByProductIdAsc(userId);
        if (rows.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");

        // Lock in a stable order so concurrent checkouts cannot both sell the same stock.
        Map<Long, Product> locked = rows.stream().map(i -> i.getProduct().getId()).distinct().sorted()
                .map(id -> products.lockById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found")))
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        Order order = new Order();
        order.setPublicId(UUID.randomUUID().toString());
        order.setUser(user);
        order.setCreatedAt(Instant.now());
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem row : rows) {
            Product product = locked.get(row.getProduct().getId());
            if (!product.isActive() || row.getQuantity() > product.getStockQuantity())
                throw new ApiException(HttpStatus.CONFLICT, "Product unavailable or insufficient stock: " + product.getId());
            product.setStockQuantity(product.getStockQuantity() - row.getQuantity());
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setUnitPrice(product.getPrice());
            item.setQuantity(row.getQuantity());
            item.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(row.getQuantity())));
            order.getItems().add(item);
            total = total.add(item.getLineTotal());
        }
        if (total.compareTo(new BigDecimal("9999999999.99")) > 0)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order total exceeds the supported limit");
        order.setTotal(total);
        Order saved = orders.save(order);
        cart.deleteAll(rows);
        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> mine(Long userId, Pageable pageable) {
        return orders.findByUserId(userId, pageable).map(OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> all(Pageable pageable) { return orders.findAll(pageable).map(OrderResponse::from); }

    @Transactional(readOnly = true)
    public OrderResponse get(String publicId, Long userId, boolean admin) {
        Order order = orders.findByPublicId(publicId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!admin && !order.getUser().getId().equals(userId))
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse cancel(String publicId, Long userId, boolean admin) {
        Order order = orders.lockByPublicId(publicId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!admin && !order.getUser().getId().equals(userId))
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        if (order.getStatus() != OrderStatus.PLACED)
            throw new ApiException(HttpStatus.CONFLICT, "Only placed orders can be cancelled");
        order.getItems().stream().map(i -> i.getProduct().getId()).distinct().sorted()
                .forEach(id -> products.lockById(id).orElseThrow());
        for (OrderItem item : order.getItems())
            item.getProduct().setStockQuantity(item.getProduct().getStockQuantity() + item.getQuantity());
        order.setStatus(OrderStatus.CANCELLED);
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse updateStatus(String publicId, OrderStatus status) {
        Order order = orders.lockByPublicId(publicId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        if (status == OrderStatus.CANCELLED) return cancel(publicId, order.getUser().getId(), true);
        if (!(order.getStatus() == OrderStatus.PLACED && status == OrderStatus.SHIPPED ||
              order.getStatus() == OrderStatus.SHIPPED && status == OrderStatus.DELIVERED))
            throw new ApiException(HttpStatus.CONFLICT, "Invalid order status transition");
        order.setStatus(status);
        return OrderResponse.from(order);
    }
}
