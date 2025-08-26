# Melody Hub – Full-stack E‑commerce

Monorepo for Melody Hub, including Backend (Node/Express + MongoDB) and Frontend (Next.js).

## Directory Structure
```
melody-hub/
  BackEnd/     # Express API (public + admin), payments, scraper
  FrontEnd/    # Next.js app (shop, admin dashboard, scraper UI)
  README.md    # This overview
```

## Prerequisites
- Node.js 18+
- MongoDB running locally or in the cloud
- (Optional) Redis
- (Optional) Stripe + MoMo accounts for payments

## Quick Start
1) Backend
```bash
cd BackEnd
npm install
# configure env in BackEnd/config/environment.js
npm run dev    # or: npm start
```
Backend runs at: http://localhost:5000 (API base: /api)

2) Frontend
```bash
cd FrontEnd
npm install
# configure .env.local (see FrontEnd/README.md)
npm run dev
```
Frontend runs at: http://localhost:3000

## Environment
- Backend: `config/environment.js` (PORT, MONGODB_URI, FRONTEND_URL, JWT_SECRET, STRIPE_* keys)
- Frontend: `.env.local` (`NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)

## Payments (flow)
- Stripe: frontend starts Checkout Session → Stripe redirects back with `?session_id=...` → UI marks success; backend webhook confirms server-side.
- MoMo: returns `orderId` + `resultCode`; frontend verifies via `/payment/momo/verify`.
- COD: handled by `paymentType=cod` on success route.

## Docs
- Backend details: `BackEnd/README.md`
- Admin API reference: `BackEnd/README-ADMIN-API.md`
- Frontend details: `FrontEnd/README.md`

## Common Scripts
- Backend: `npm run dev`, `npm start`
- Frontend: `npm run dev`, `npm run build`, `npm start`, `npm run lint`

## Notes
- Roles: Customer, Artist, Admin
- Admin routes require JWT + admin role
- Scraper endpoints and UI available for product ingestion
