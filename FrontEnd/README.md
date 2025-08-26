# Melody Hub - Frontend (Next.js)

Modern Next.js app for Melody Hub e-commerce with authentication, catalog browsing, cart/checkout, admin dashboard, and scraper management UI.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript, TailwindCSS, shadcn/ui
- next-auth (JWT), axios

## Getting Started

```bash
cd FrontEnd
npm install
npm run dev
```
Open http://localhost:3000 in your browser.

## Environment Variables
Create `.env.local` in `FrontEnd/`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_SECRET=dev-secret
NEXTAUTH_URL=http://localhost:3000
```

## Available Scripts
- `npm run dev` – start dev server
- `npm run build` – build for production
- `npm run start` – start production server
- `npm run lint` – lint code

## Features
- Public: homepage, product listing/detail, search, cart, checkout
- Payments: Stripe Checkout, MoMo
- Auth: login/register/forgot/reset (JWT via API)
- Tracking: order status tracking
- Admin: dashboard (users, products, categories, orders, statistics)
- Scraper management UI (run, schedule, save to DB, history/CSV)

## Payment Success Handling
- Stripe: success redirect includes `?session_id=...` and is treated as success client-side (server webhook confirms).
- MoMo: success is based on `orderId` + `resultCode` and verified via backend.
- COD: determined by `paymentType=cod` in URL.

## Development Tips
- Update `NEXT_PUBLIC_API_URL` to point to backend.
- JWT is stored in `localStorage` for API calls; next-auth handles session UI.
- UI components in `components/ui/` (shadcn style).
