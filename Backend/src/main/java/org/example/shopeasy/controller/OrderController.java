package org.example.shopeasy.controller;

import org.example.shopeasy.exception.ApiException;
import org.example.shopeasy.model.dto.OrderResponse;
import org.example.shopeasy.model.dto.PageResponse;
import org.example.shopeasy.service.OrderService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orders;
    public OrderController(OrderService orders) { this.orders = orders; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse checkout(@AuthenticationPrincipal Jwt jwt) { return orders.checkout(Long.valueOf(jwt.getSubject())); }

    @GetMapping
    public PageResponse<OrderResponse> mine(@AuthenticationPrincipal Jwt jwt,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return PageResponse.from(orders.mine(Long.valueOf(jwt.getSubject()), page(page, size)));
    }

    @GetMapping("/{id}")
    public OrderResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        return orders.get(id, Long.valueOf(jwt.getSubject()), isAdmin(jwt));
    }

    @PatchMapping("/{id}/cancel")
    public OrderResponse cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        return orders.cancel(id, Long.valueOf(jwt.getSubject()), isAdmin(jwt));
    }

    static PageRequest page(int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid pagination");
        return PageRequest.of(page, size, Sort.by("id").descending());
    }

    private boolean isAdmin(Jwt jwt) { return "ADMIN".equals(jwt.getClaimAsString("role")); }
}
