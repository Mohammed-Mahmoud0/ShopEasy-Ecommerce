package org.example.shopeasy.controller;

import org.example.shopeasy.model.dto.ProductResponse;
import org.example.shopeasy.model.dto.PageResponse;
import org.example.shopeasy.service.ProductService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {
    private final ProductService products;
    public AdminProductController(ProductService products) { this.products = products; }

    @GetMapping
    public PageResponse<ProductResponse> all(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        return PageResponse.from(products.allForAdmin(OrderController.page(page, size)));
    }
}
