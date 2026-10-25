package org.example.shopeasy.service;

import org.example.shopeasy.exception.ApiException;
import org.example.shopeasy.model.AppUser;
import org.example.shopeasy.model.CartItem;
import org.example.shopeasy.model.Product;
import org.example.shopeasy.model.dto.CartItemResponse;
import org.example.shopeasy.model.dto.CartResponse;
import org.example.shopeasy.repo.CartItemRepo;
import org.example.shopeasy.repo.ProductRepo;
import org.example.shopeasy.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {
    private final CartItemRepo items;
    private final ProductRepo products;
    private final UserRepo users;

    public CartService(CartItemRepo items, ProductRepo products, UserRepo users) {
        this.items = items;
        this.products = products;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public CartResponse get(Long userId) { return map(items.findByUserIdOrderByProductIdAsc(userId)); }

    @Transactional
    public CartResponse set(Long userId, Long productId, int quantity) {
        AppUser user = users.lockById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Product product = products.findById(productId).filter(Product::isActive)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        if (quantity > product.getStockQuantity())
            throw new ApiException(HttpStatus.CONFLICT, "Requested quantity exceeds stock");
        CartItem item = items.findByUserIdAndProductId(userId, productId).orElseGet(CartItem::new);
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(quantity);
        items.save(item);
        return get(userId);
    }

    @Transactional
    public void remove(Long userId, Long productId) {
        users.lockById(userId).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        CartItem item = items.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cart item not found"));
        items.delete(item);
    }

    private CartResponse map(List<CartItem> rows) {
        List<CartItemResponse> result = rows.stream().map(item -> {
            Product p = item.getProduct();
            BigDecimal line = p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return new CartItemResponse(p.getId(), p.getName(), item.getQuantity(), p.getPrice(), line);
        }).toList();
        BigDecimal total = result.stream().map(CartItemResponse::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(result, total);
    }
}
