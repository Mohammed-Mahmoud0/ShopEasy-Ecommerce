package org.example.shopeasy.controller;

import jakarta.validation.Valid;
import org.example.shopeasy.model.dto.*;
import org.example.shopeasy.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cart;
    public CartController(CartService cart) { this.cart = cart; }

    @GetMapping
    public CartResponse get(@AuthenticationPrincipal Jwt jwt) { return cart.get(Long.valueOf(jwt.getSubject())); }

    @PostMapping("/items")
    public CartResponse add(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CartItemRequest request) {
        return cart.set(Long.valueOf(jwt.getSubject()), request.productId(), request.quantity());
    }

    @PutMapping("/items/{productId}")
    public CartResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable Long productId,
                               @Valid @RequestBody QuantityRequest request) {
        return cart.set(Long.valueOf(jwt.getSubject()), productId, request.quantity());
    }

    @DeleteMapping("/items/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal Jwt jwt, @PathVariable Long productId) {
        cart.remove(Long.valueOf(jwt.getSubject()), productId);
    }
}
