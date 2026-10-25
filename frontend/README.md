# ShopEasy frontend

The React 19 storefront for the [ShopEasy Java API](../README.md). Built with Vite, Tailwind CSS 4, React Router, and TanStack Query.

## Development

Run the Spring Boot API on `http://localhost:8080`, then in this directory:

```powershell
npm install
npm run dev
```

Vite proxies `/api` requests to the backend. For a different API origin, set `VITE_API_BASE_URL` in `.env.local`. Do not place secrets in frontend environment files; their values are exposed in the browser bundle.

## Structure

- `src/api/client.js` owns HTTP requests and maps Java DTOs into the view model used by the UI.
- `src/api/queries.js` owns TanStack Query hooks and cache invalidation.
- `src/context/` holds authentication, cart, language, theme, and toast state.
- `src/pages/` contains the customer and administrator screens.
- `src/components/` contains reusable interface elements.
- `src/i18n/dictionary.js` contains English and Arabic strings.

JWTs are sent in the `Authorization: Bearer` header. The cart and orders are stored by the backend. Favorites currently use browser local storage, scoped to the signed-in account. Checkout does not process payment.

## Quality checks

```powershell
npm run lint
npm run build
```

See the root README for the complete setup and a suggested end-to-end test flow.
