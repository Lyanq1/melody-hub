# Melody Hub - Backend (Admin + Public API)

This backend powers the Melody Hub e-commerce application. It exposes public APIs for catalog, cart and checkout, and protected admin APIs for managing products, categories, users and system statistics.

## Tech Stack
- Node.js + Express
- MongoDB (Mongoose)
- Redis (optional cache)
- Stripe and MoMo payments
- JWT-based auth, role-based authorization (Customer/Artist/Admin)

## Prerequisites
- Node.js 18+
- MongoDB instance
- Redis (optional)
- Stripe account (for card payments)

## Structure
```
BackEnd/
  config/          # env, db, redis
  controllers/     # route handlers
  models/          # mongoose schemas
  routes/          # route definitions
  services/        # business logic
  middleware/      # auth, error
  scrape/          # scraper tools & scheduler
  server.js        # server bootstrap
```

## Environment
Create `config/environment.js` exporting values:
```js
export const env = {
  PORT: 5000,
  MONGODB_URI: 'mongodb://localhost:27017/Melodyhub',
  FRONTEND_URL: 'http://localhost:3000',
  JWT_SECRET: 'your-secret',
  STRIPE_SECRET_KEY: 'sk_test_xxx',
  STRIPE_WEBHOOK_SECRET: 'whsec_xxx'
}
```

## Install & Run
```bash
cd BackEnd
npm install
npm run dev   # or: npm start
```
API base URL: `http://localhost:5000/api`

## Auth
- Bearer token `Authorization: Bearer <token>`
- Middlewares: `verifyToken`, `canManageSystem`

## Admin Routes (highlights)
- Users: `GET /admin/users`, `GET/PUT/DELETE /admin/users/:userId`, `PATCH /admin/users/:userId/role`
- Products: `GET /admin/products`, `GET /admin/products/:id`, `POST /admin/products`, `PUT /admin/products/:id`, `DELETE /admin/products/:id`, `DELETE /admin/products/bulk`
- Categories: `GET/POST/PUT/DELETE /admin/categories`
- Orders: `GET /admin/orders`, `GET /admin/orders/:id`, `PATCH /admin/orders/:id/status`, `PATCH /admin/orders/:id/payment`, `DELETE /admin/orders/:id`
- Stats: `GET /admin/system-stats`, `GET /admin/product-stats`, `GET /admin/stats/comprehensive`, `GET /admin/stats/revenue`, `GET /admin/stats/customers`

## Public Routes (examples)
- Products: `GET /product`, `GET /product/:id`
- Cart: `GET/POST/PUT/DELETE /cart`
- Orders: `POST /order`
- Payment:
  - MoMo: `POST /payment/momo`, `POST /payment/momo/verify`
  - Stripe: `POST /payment/stripe/checkout-session`, webhook `POST /payment/stripe/webhook`

## Scraper
- `/scrape/config`, `/scrape/run`, `/scrape/status`, `/scrape/history`, `/scrape/save-to-db`, `/scrape/download-csv`

## Notes
- Centralized error handling, Mongoose models in `models/`
- Roles: `Customer`, `Artist`, `Admin`
- See `README-ADMIN-API.md` for detailed admin API docs.
