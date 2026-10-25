package org.example.shopeasy.service;

import org.example.shopeasy.exception.ApiException;
import org.example.shopeasy.model.Product;
import org.example.shopeasy.model.ProductImage;
import org.example.shopeasy.model.dto.ProductRequest;
import org.example.shopeasy.model.dto.ProductResponse;
import org.example.shopeasy.repo.ProductImageRepo;
import org.example.shopeasy.repo.ProductRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Locale;

@Service
public class ProductService {
    private final ProductRepo products;
    private final ProductImageRepo images;
    public ProductService(ProductRepo products, ProductImageRepo images) {
        this.products = products;
        this.images = images;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String search, String category, BigDecimal minPrice,
                                        BigDecimal maxPrice, Pageable pageable) {
        if (minPrice != null && minPrice.signum() < 0 || maxPrice != null && maxPrice.signum() < 0 ||
                minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid price range");
        }
        Specification<Product> filter = (root, query, cb) -> cb.isTrue(root.get("active"));
        String searchText = blankToNull(search);
        if (searchText != null) {
            String pattern = "%" + searchText.toLowerCase(Locale.ROOT) + "%";
            filter = filter.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)));
        }
        String categoryText = blankToNull(category);
        if (categoryText != null) {
            String normalized = categoryText.toLowerCase(Locale.ROOT);
            filter = filter.and((root, query, cb) -> cb.equal(cb.lower(root.get("category")), normalized));
        }
        if (minPrice != null)
            filter = filter.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        if (maxPrice != null)
            filter = filter.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        return products.findAll(filter, pageable).map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public java.util.List<String> categories() {
        return products.findActiveCategories();
    }

    @Transactional(readOnly = true)
    public ProductResponse get(Long id) {
        Product product = products.findById(id).filter(Product::isActive)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return ProductResponse.from(products.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = products.lockById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        apply(product, request);
        return ProductResponse.from(product);
    }

    @Transactional
    public void deactivate(Long id) {
        Product product = products.lockById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        product.setActive(false);
    }

    @Transactional
    public void saveImage(Long productId, MultipartFile file) {
        Product product = products.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        if (file.isEmpty() || file.getSize() > 2_000_000) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Image must be between 1 byte and 2 MB");
        }
        byte[] data;
        try { data = file.getBytes(); }
        catch (IOException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "Could not read image"); }
        String type = detectImageType(data);
        if (type == null) throw new ApiException(HttpStatus.BAD_REQUEST, "Only PNG, JPEG, and WebP images are supported");
        ProductImage image = images.findById(productId).orElseGet(ProductImage::new);
        image.setProduct(product);
        image.setContentType(type);
        image.setData(data);
        images.save(image);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> allForAdmin(Pageable pageable) {
        return products.findAll(pageable).map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductImage image(Long productId) {
        products.findById(productId).filter(Product::isActive)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
        return images.findById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Image not found"));
    }

    private void apply(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setDescription(request.description().trim());
        product.setBrand(request.brand().trim());
        product.setPrice(request.price());
        product.setCategory(request.category().trim());
        product.setStockQuantity(request.stockQuantity());
        product.setActive(request.active());
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private String detectImageType(byte[] b) {
        if (b.length >= 8 && Arrays.equals(Arrays.copyOf(b, 8), new byte[]{(byte) 137, 80, 78, 71, 13, 10, 26, 10})) return "image/png";
        if (b.length >= 3 && (b[0] & 255) == 255 && (b[1] & 255) == 216 && (b[2] & 255) == 255) return "image/jpeg";
        if (b.length >= 12 && new String(b, 0, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("RIFF") &&
                new String(b, 8, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("WEBP")) return "image/webp";
        return null;
    }
}
