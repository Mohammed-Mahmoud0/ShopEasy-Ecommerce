package org.example.shopeasy.controller;

import jakarta.validation.Valid;
import org.example.shopeasy.model.dto.OrderResponse;
import org.example.shopeasy.model.dto.PageResponse;
import org.example.shopeasy.model.dto.OrderStatusRequest;
import org.example.shopeasy.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    private final OrderService orders;
    public AdminOrderController(OrderService orders) { this.orders = orders; }

    @GetMapping
    public PageResponse<OrderResponse> all(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "20") int size) {
        return PageResponse.from(orders.all(OrderController.page(page, size)));
    }

    @PatchMapping("/{id}/status")
    public OrderResponse status(@PathVariable String id, @Valid @RequestBody OrderStatusRequest request) {
        return orders.updateStatus(id, request.status());
    }
}
