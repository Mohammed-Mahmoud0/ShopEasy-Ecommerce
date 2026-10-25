package org.example.shopeasy;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "debug=false",
        "logging.level.root=ERROR",
        "spring.datasource.url=jdbc:h2:mem:shopeasytest;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;INIT=CREATE TABLE IF NOT EXISTS legacy_table(id INT)",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate",
        "app.jwt.secret=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        "app.admin.email=admin@example.com",
        "app.admin.password=strong-admin-password-123"
})
@AutoConfigureMockMvc
class ApiSmokeTest {
    @Autowired MockMvc mvc;

    @Test
    void completeCustomerFlowAndRoleChecks() throws Exception {
        mvc.perform(get("/api/products")).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        String adminBody = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@example.com\",\"password\":\"strong-admin-password-123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String adminToken = JsonPath.read(adminBody, "$.accessToken");
        String productBody = mvc.perform(post("/api/products").header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Notebook\",\"description\":\"A5 dotted\",\"brand\":\"Paper Co\",\"price\":12.50,\"category\":\"Stationery\",\"stockQuantity\":10,\"active\":true}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Number productId = JsonPath.read(productBody, "$.id");
        mvc.perform(get("/api/products/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("Stationery"));
        mvc.perform(get("/api/products").param("sort", "nameAsc").param("category", "Stationery"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/products").param("search", "NOTE").param("minPrice", "10")
                        .param("maxPrice", "15"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
        String customerBody = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Alex\",\"email\":\"alex@example.com\",\"password\":\"strong-password-123\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String customerToken = JsonPath.read(customerBody, "$.accessToken");
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alex@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
        mvc.perform(get("/api/admin/orders").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/cart/items").header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":" + productId + ",\"quantity\":2}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(25.0));
        String orderBody = mvc.perform(post("/api/orders").header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.total").value(25.0))
                .andReturn().getResponse().getContentAsString();
        String orderId = JsonPath.read(orderBody, "$.id");
        mvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.stockQuantity").value(8));
        mvc.perform(patch("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
        mvc.perform(get("/api/products/" + productId)).andExpect(jsonPath("$.stockQuantity").value(10));
    }
}
