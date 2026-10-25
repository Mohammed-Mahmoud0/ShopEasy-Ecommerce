# ShopEasy API

The ShopEasy Spring Boot 4 / Java 21 API. Customers can browse products, register, maintain a cart, place orders, and view or cancel their own orders. Administrators manage products and move orders through their lifecycle. PostgreSQL stores the data; Flyway manages the schema.

## Run locally

1. Install Java 21 and PostgreSQL. Ensure the `shopeasy` database exists. Flyway creates the application's `shopeasy_app` schema. The database user must have permission to create that schema on first run.
2. Copy `.env.example` to `.env` in `Backend/`, then set your PostgreSQL credentials, a Base64 encoded JWT key of at least 32 bytes, and administrator credentials. This file is Git-ignored. The application reads it when started from either the repository root or `Backend/`.
3. Run `./mvnw.cmd spring-boot:run` on Windows or `./mvnw spring-boot:run` on macOS/Linux from `Backend/`, or run `ShopEasyApplication` in your IDE with either the repository root or `Backend/` as its working directory. Flyway creates the tables at startup. The API listens on `http://localhost:8080`.

Environment variables can override values in `.env`. Keep the same `JWT_SECRET` across restarts or previously issued tokens become invalid. Set `JWT_ISSUER` to the public API URL when deploying; it defaults to `http://localhost:8080`. The admin password is used only when the account is first created; changing it later does not reset an existing admin account.

## API

Use `Authorization: Bearer <accessToken>` for protected routes. Register or log in to receive a one-hour token. Prices are calculated on the server at checkout; a cart total is only a preview. There is no payment integration.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Get JWT |
| GET | `/api/products` | Public | Search/filter active products |
| GET | `/api/products/categories` | Public | List active product categories |
| GET | `/api/products/{id}` | Public | Product details |
| GET | `/api/products/{id}/image` | Public | Product image |
| GET | `/api/users/me` | Authenticated | Current account details and role |
| GET | `/api/admin/products` | Admin | List all products, including inactive |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/{id}` | Admin | Replace product fields |
| DELETE | `/api/products/{id}` | Admin | Deactivate product |
| PUT | `/api/products/{id}/image` | Admin | Upload PNG/JPEG/WebP multipart field `file` (2 MB max) |
| GET | `/api/cart` | Authenticated | View cart |
| POST | `/api/cart/items` | Authenticated | Add or set a product quantity |
| PUT | `/api/cart/items/{productId}` | Authenticated | Set quantity |
| DELETE | `/api/cart/items/{productId}` | Authenticated | Remove item |
| POST | `/api/orders` | Authenticated | Checkout current cart |
| GET | `/api/orders` | Authenticated | My orders |
| GET | `/api/orders/{id}` | Owner or admin | Order details |
| PATCH | `/api/orders/{id}/cancel` | Owner or admin | Cancel a placed order and restore stock |
| GET | `/api/admin/orders` | Admin | List all orders |
| PATCH | `/api/admin/orders/{id}/status` | Admin | `SHIPPED`, `DELIVERED`, or `CANCELLED` |

Product search supports `search`, `category`, `minPrice`, `maxPrice`, `sort` (`newest`, `nameAsc`, `priceAsc`, `priceDesc`), `page` (from 0), and `size` (1–100). Product and order lists are paginated. Orders can move from `PLACED` to `SHIPPED` to `DELIVERED`; only `PLACED` orders can be cancelled.

Example request bodies:

```json
POST /api/auth/register
{"name":"Alex","email":"alex@example.com","password":"strong-password-123"}

POST /api/auth/login
{"email":"alex@example.com","password":"strong-password-123"}

POST /api/products
{"name":"Notebook","description":"A5 dotted notebook","brand":"Paper Co","price":12.50,"category":"Stationery","stockQuantity":10,"active":true}

POST /api/cart/items
{"productId":1,"quantity":2}

PATCH /api/admin/orders/{id}/status
{"status":"SHIPPED"}
```

`POST /api/orders` needs no body; it checks out the current cart. API errors use HTTP status codes and JSON messages. Validation errors include a `fields` object.

## Design notes

- Controllers handle HTTP input and output; services own business rules; repositories own persistence. Entities are never returned directly from the API.
- Flyway migrations define the `shopeasy_app` schema and JPA validates it at startup. `open-in-view` is disabled, so response mapping happens inside transactions.
- Checkout and cancellation use transactions and row locks to protect stock when requests race. Order items retain their name and price snapshots. Deleting a product deactivates it so order history remains intact.
- Passwords are stored with BCrypt. JWTs are signed with HS256 and checked for signature, expiry, and issuer. Public registration cannot grant admin access.

Run `./mvnw.cmd test` (Windows) or `./mvnw test` (macOS/Linux) for the checkout tests. Docker packaging is intentionally left for the final project step.
