package org.example.shopeasy;

import org.example.shopeasy.exception.ApiException;
import org.example.shopeasy.model.*;
import org.example.shopeasy.repo.*;
import org.example.shopeasy.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class OrderServiceTest {
    private final OrderRepo orders = mock(OrderRepo.class);
    private final CartItemRepo cart = mock(CartItemRepo.class);
    private final ProductRepo products = mock(ProductRepo.class);
    private final UserRepo users = mock(UserRepo.class);
    private OrderService service;
    private AppUser user;

    @BeforeEach
    void setup() {
        service = new OrderService(orders, cart, products, users);
        user = new AppUser();
        user.setId(7L);
        when(users.lockById(7L)).thenReturn(Optional.of(user));
        when(orders.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void checkoutUsesCurrentPriceAndReducesStock() {
        Product product = product(3L, "Notebook", "12.50", 5);
        CartItem item = cartItem(product, 2);
        when(cart.findByUserIdOrderByProductIdAsc(7L)).thenReturn(List.of(item));
        when(products.lockById(3L)).thenReturn(Optional.of(product));

        var response = service.checkout(7L);

        assertEquals(new BigDecimal("25.00"), response.total());
        assertEquals(3, product.getStockQuantity());
        assertEquals("Notebook", response.items().getFirst().productName());
        ArgumentCaptor<Order> saved = ArgumentCaptor.forClass(Order.class);
        verify(orders).save(saved.capture());
        assertEquals(new BigDecimal("12.50"), saved.getValue().getItems().getFirst().getUnitPrice());
        verify(cart).deleteAll(List.of(item));
    }

    @Test
    void checkoutRejectsInsufficientStockWithoutCreatingOrder() {
        Product product = product(3L, "Notebook", "12.50", 1);
        when(cart.findByUserIdOrderByProductIdAsc(7L)).thenReturn(List.of(cartItem(product, 2)));
        when(products.lockById(3L)).thenReturn(Optional.of(product));

        assertThrows(ApiException.class, () -> service.checkout(7L));

        assertEquals(1, product.getStockQuantity());
        verify(orders, never()).save(any());
        verify(cart, never()).deleteAll(any());
    }

    @Test
    void cancellingPlacedOrderRestoresStockOnce() {
        Product product = product(3L, "Notebook", "12.50", 3);
        Order order = new Order();
        order.setPublicId("order-1");
        order.setUser(user);
        order.setStatus(OrderStatus.PLACED);
        order.setTotal(new BigDecimal("25.00"));
        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setProductName("Notebook");
        item.setUnitPrice(new BigDecimal("12.50"));
        item.setQuantity(2);
        item.setLineTotal(new BigDecimal("25.00"));
        order.getItems().add(item);
        when(orders.lockByPublicId("order-1")).thenReturn(Optional.of(order));
        when(products.lockById(3L)).thenReturn(Optional.of(product));

        service.cancel("order-1", 7L, false);

        assertEquals(5, product.getStockQuantity());
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        assertThrows(ApiException.class, () -> service.cancel("order-1", 7L, false));
        assertEquals(5, product.getStockQuantity());
    }

    private Product product(Long id, String name, String price, int stock) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setPrice(new BigDecimal(price));
        p.setStockQuantity(stock);
        p.setActive(true);
        return p;
    }

    private CartItem cartItem(Product product, int quantity) {
        CartItem item = new CartItem();
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(quantity);
        return item;
    }
}
