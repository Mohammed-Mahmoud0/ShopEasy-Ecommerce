package org.example.shopeasy.controller;

import jakarta.validation.Valid;
import org.example.shopeasy.exception.ApiException;
import org.example.shopeasy.model.ProductImage;
import org.example.shopeasy.model.dto.ProductRequest;
import org.example.shopeasy.model.dto.ProductResponse;
import org.example.shopeasy.model.dto.PageResponse;
import org.example.shopeasy.service.ProductService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService products;
    public ProductController(ProductService products) { this.products = products; }

    @GetMapping
    public PageResponse<ProductResponse> search(@RequestParam(required = false) String search,
                                        @RequestParam(required = false) String category,
                                        @RequestParam(required = false) BigDecimal minPrice,
                                        @RequestParam(required = false) BigDecimal maxPrice,
                                        @RequestParam(defaultValue = "newest") String sort,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        if (page < 0 || size < 1 || size > 100) throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid pagination");
        Sort ordering = switch (sort) {
            case "newest" -> Sort.by("id").descending();
            case "priceAsc" -> Sort.by("price").ascending().and(Sort.by("id").ascending());
            case "priceDesc" -> Sort.by("price").descending().and(Sort.by("id").descending());
            case "nameAsc" -> Sort.by("name").ascending().and(Sort.by("id").ascending());
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid sort");
        };
        return PageResponse.from(products.search(search, category, minPrice, maxPrice,
                PageRequest.of(page, size, ordering)));
    }

    @GetMapping("/categories")
    public java.util.List<String> categories() { return products.categories(); }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) { return products.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody ProductRequest request) { return products.create(request); }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return products.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { products.deactivate(id); }

    @PutMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void uploadImage(@PathVariable Long id, @RequestPart("file") MultipartFile file) {
        products.saveImage(id, file);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> image(@PathVariable Long id) {
        ProductImage image = products.image(id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(image.getContentType())).body(image.getData());
    }
}
