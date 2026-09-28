# VIRASAT

> Heritage craft meets fair trade — a full-stack e-commerce marketplace connecting India's artisan community directly with buyers.

VIRASAT is a three-role marketplace platform where artisans sell handcrafted products through a moderated pipeline, buyers shop with trust signals (verification badges, GI-tag style markers, reviews, artisan stories), and admins run the platform — moderation, fulfilment, and analytics. The differentiator is **emotional connection**: every product links back to the artisan who made it.

- **Frontend:** React 18 SPA (Vite) — `client/`
- **Backend:** Express REST API (Node.js ESM) — `server/`
- **Database:** MongoDB (Mongoose 8)
- **Payments:** Razorpay (callback + webhook verification)
- **Media:** Cloudinary (via Multer memory-storage uploads)
- **Status:** MVP v0.1.0, deployed on Vercel (client) + Render (API) + MongoDB Atlas

---

## Table of Contents

- [Features](#features)
- [Roles](#roles)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Database Models](#database-models)
- [Authentication & Security](#authentication--security)
- [Product Lifecycle](#product-lifecycle)
- [Design System](#design-system)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## Features

**Storefront (Buyers)**
- Home with featured artisans, categories, and featured products
- Shop with URL-driven search / category / price filters and pagination
- Product detail pages with image gallery, artisan story snippet, and reviews
- Artisan story pages (bio, region, craft, photos)
- Cart (server-synced for logged-in buyers, localStorage guest cart merged on login)
- Wishlist (localStorage-only, no auth required)
- Razorpay checkout with signature verification, order history
- Google OAuth login (buyers only) + email/password auth

**Artisan Dashboard**
- Overview with revenue / delivered-units stats and orders-by-status chart (Recharts)
- Product management — create/edit with Cloudinary image uploads, rejection reasons shown
- Profile editor (bio, craft, region, story, photos)
- Line-item order fulfilment (mark items shipped/delivered)
- In-app notifications (approvals, rejections, orders)

**Admin Dashboard**
- Platform overview (aggregated stats + chart)
- Product moderation queue — approve (→ published) or reject (reason required, notifies artisan)
- Direct listing (admin-created products bypass moderation)
- Artisan verification & featuring, user enable/disable, category CRUD
- Order management with status updates

---

## Roles

| Role | Login | Capabilities |
|---|---|---|
| `user` | `/login`, Google OAuth | Browse, cart, wishlist, checkout, reviews, order history |
| `artisan` | `/artisan/login` (unlinked portal) | Product CRUD (moderated), profile, fulfilment, notifications |
| `admin` | `/admin/login` (unlinked portal) | Moderation, verification, categories, users, orders, analytics |

Admins cannot self-register — they are seeded once via `npm run seed:admin`.

---

## Tech Stack

### Frontend (`client/`)
| Concern | Choice |
|---|---|
| Build tool | Vite 6 (dev server on `:5173`, `/api` proxied to `:5000`) |
| UI | React 18 + React Router v6 |
| Styling | Tailwind CSS 3.4 (custom design tokens), PostCSS/Autoprefixer |
| State | Zustand 5 (`authStore`, `cartStore` + `wishlistStore` with `persist`) |
| HTTP | Axios (Bearer interceptor + shared 401 refresh-retry) |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Charts | Recharts |

### Backend (`server/`)
| Concern | Choice |
|---|---|
| Framework | Express 4 (ESM) |
| Database | MongoDB Atlas via Mongoose 8 (`mongodb-memory-server` in tests) |
| Auth | JWT (15-min access + 7-day httpOnly refresh cookie), bcrypt, Passport Google OAuth 2.0 |
| Validation | Zod schemas at every write route (middleware runs before controllers) |
| Payments | Razorpay SDK (order creation, timing-safe signature verify, webhook) |
| Media | Cloudinary + Multer 2 (memory storage, type/size/count whitelist) |
| Hardening | helmet, CORS allowlist, express-rate-limit, express-mongo-sanitize |
| Tests | Jest + Supertest (ESM via `--experimental-vm-modules`) |

### Infrastructure
Vercel (client) · Render (API, `render.yaml` blueprint) · MongoDB Atlas · Cloudinary · Razorpay · GitHub Actions CI

---

## Architecture

Two-tier client–server monorepo. One React SPA serves three role-scoped route trees; the Express API is organized in layered MVC style (`routes → middleware → controllers → models`) with server-side RBAC enforced on every protected route.

```
┌─────────────────────────────────────────────────────────────────────┐
│                            BROWSER (SPA)                            │
│                                                                     │
│  ┌──────────────────────── client/src ─────────────────────────┐    │
│  │  App.jsx — three route trees under one BrowserRouter        │    │
│  │                                                             │    │
│  │  StorefrontLayout      ArtisanLayout          AdminLayout   │    │
│  │  ┌──────────────┐     ┌──────────────┐      ┌────────────┐  │    │
│  │  │ /  shop  cart│     │ /artisan/*   │      │ /admin/*   │  │    │
│  │  │ product  ... │     │ (artisan-    │      │ (admin-    │  │    │
│  │  │ checkout*    │     │  guarded)    │      │  guarded)  │  │    │
│  │  │ orders*      │     └──────────────┘      └────────────┘  │    │
│  │  └──────────────┘      * = ProtectedRoute role guard        │    │
│  │                                                             │    │
│  │  Zustand stores: authStore · cartStore · wishlistStore      │    │
│  │  lib/api.js: axios + Bearer header + 401 → shared refresh   │    │
│  │  AuthBootstrap: silent POST /auth/refresh on page load      │    │
│  └──────────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────────┼───────────────────────────────────┘
                        HTTPS JSON │ (/api proxy in dev)
┌─────────────────────────────────▼───────────────────────────────────┐
│                       EXPRESS API (server/)                        │
│                                                                     │
│  Middleware pipeline (app.js):                                      │
│    helmet → CORS allowlist → [webhook: express.raw] →               │
│    express.json → cookieParser → mongoSanitize → passport           │
│                                                                     │
│  Per-request flow:                                                  │
│    Route → rateLimiter → requireAuth (JWT) → requireRole (RBAC)     │
│         → validate(zod) → controller → Mongoose model               │
│         → asyncHandler → central JSON error handler                 │
│                                                                     │
│  External services:                                                 │
│    MongoDB Atlas · Razorpay (pay + webhook) · Cloudinary (images)   │
└─────────────────────────────────────────────────────────────────────┘
```

### Key architectural decisions

- **Dual-token JWT auth** — short-lived access token held in memory (Zustand), long-lived refresh token in an httpOnly cookie scoped to `/api/auth` (SameSite `strict` in dev, `none` + `Secure` in prod for cross-domain Vercel ↔ Render). Rotated on every refresh.
- **Silent re-auth** — `AuthBootstrap` calls `POST /api/auth/refresh` on load; the axios response interceptor retries one shared refresh on any 401; `ProtectedRoute` waits while auth status is `idle|loading` before redirecting.
- **Server cart for buyers, guest cart locally** — guest cart lives in localStorage (`virasat-cart`) and is merged server-side via `POST /api/cart/merge` on login.
- **Moderation pipeline** — artisan products are always created as `pending`; only admins can move them to `published`. Editing a rejected product resubmits it to the queue.
- **Razorpay webhook before JSON parsing** — mounted with `express.raw()` in `app.js` so the HMAC signature can be verified against the raw body; payment verification is timing-safe.
- **Cold-start resilience** — the `useFetch` hook retries connection errors and 502/503/504 with linear backoff (Render free-plan cold starts).
- **Trust proxy** — enabled behind Render so rate limiting sees real client IPs and Secure cookies work.

---

## Folder Structure

```
VIRASAT/
├── package.json                  # Root orchestration (concurrently)
├── render.yaml                   # Render blueprint for the API
├── .github/workflows/ci.yml      # CI: server tests + client build
├── CLAUDE.md                     # Project ground-truth spec
├── DEPLOY.md                     # Step-by-step deployment guide
├── VIRASAT_BUILD_PHASES.md       # Phased build prompts (Phases 0–11)
│
├── client/                       # ─── React SPA (Vite) ───
│   ├── index.html                # SPA shell
│   ├── vite.config.js            # Port 5173, /api proxy → :5000
│   ├── tailwind.config.js        # Brand design tokens
│   ├── postcss.config.js
│   ├── vercel.json               # SPA rewrites for Vercel
│   ├── .env / .env.example       # VITE_* vars
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # All routes (3 role-scoped trees)
│       ├── index.css             # Design tokens, fonts, animations
│       ├── assets/               # Logo & static assets
│       ├── lib/                  # api.js (axios+refresh), auth.js,
│       │                         #   format.js, razorpay.js
│       ├── store/                # Zustand: authStore, cartStore,
│       │                         #   wishlistStore
│       ├── hooks/
│       │   └── useFetch.js       # GET helper w/ retry (cold starts)
│       ├── layouts/              # Storefront, Artisan, Admin, Dashboard
│       ├── components/           # AuthBootstrap, ProtectedRoute, Navbar,
│       │   │                     #   Footer, ProductCard, CategoryCard,
│       │   │                     #   FeaturedArtisans, RatingStars, Reveal,
│       │   │                     #   StatTile, PagePlaceholder, ...
│       │   └── ui/               # Design-system kit: Button, Input,
│       │                         #   Card, Badge
│       └── pages/
│           ├── storefront/       # Home, Shop, ArtForms, ProductDetail,
│           │                     #   ArtisanStory, Cart, Checkout, Orders,
│           │                     #   Wishlist, Login, Register
│           ├── artisan/          # Login, Register, Overview, Products,
│           │                     #   ProductForm, Profile, Orders,
│           │                     #   Notifications
│           └── admin/            # Login, Overview, Orders, Moderation,
│                                 #   DirectListing, Artisans, Users,
│                                 #   Categories
│
└── server/                       # ─── Express REST API (ESM) ───
    ├── index.js                  # Entry: dotenv → connect DB → listen
    ├── app.js                    # Express app: middleware + route mounting
    ├── package.json
    ├── jest.config.js
    ├── .env / .env.example
    ├── config/                   # db.js, passport.js, razorpay.js,
    │                             #   cloudinary.js
    ├── models/                   # User, ArtisanProfile, Product, Category,
    │                             #   Cart, Order, Review, Notification
    ├── middleware/               # auth.js (JWT + RBAC), validate.js (Zod),
    │                             #   rateLimit.js, upload.js (Multer)
    ├── controllers/              # auth, product, category, cart, order,
    │                             #   review, publicArtisan, artisanDashboard,
    │                             #   adminDashboard
    ├── routes/                   # auth, product, category, cart, checkout,
    │                             #   order, artisanProduct/Order/Dashboard/
    │                             #   Public, adminProduct/Order/Dashboard
    ├── services/
    │   └── cloudinaryService.js  # Upload/delete helpers
    ├── utils/                    # token.js (JWT signing), asyncHandler.js
    ├── scripts/
    │   └── seedAdmin.js          # One-time admin seeding
    └── tests/                    # auth.test.js, checkout.test.js,
                                  #   moderation.test.js, setup.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- Razorpay, Cloudinary, and Google OAuth credentials (optional for a first run — features degrade gracefully)

### Install & run

```bash
# 1. Install all workspace dependencies
npm run install:all

# 2. Configure environment (see table below)
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Seed the first admin account
cd server && npm run seed:admin && cd ..

# 4. Run client + server together
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000 (health check at `/api/health`)

### Useful scripts

| Command | Where | What it does |
|---|---|---|
| `npm run dev` | root | Runs client + server concurrently |
| `npm run install:all` | root | Installs root + client + server deps |
| `npm run build:client` | root | Production Vite build |
| `npm run start:server` | root | Starts server in production mode |
| `npm run dev` | server | Nodemon watch mode |
| `npm run seed:admin` | server | Creates the admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` |
| `npm test` | server | Jest + Supertest integration tests |

---

## Environment Variables

### `server/.env`

| Variable | Purpose |
|---|---|
| `NODE_ENV` / `PORT` | Environment and listen port (default 5000) |
| `CLIENT_ORIGIN` | CORS allowlist — comma-separated origins |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` / `JWT_ACCESS_EXPIRES` | Access-token signing (15 min default) |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES` | Refresh-token signing (7 days) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` | Google OAuth (buyers only; strategy registers only if set) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | Payments + webhook HMAC |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image storage |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used by the one-time admin seed script |

### `client/.env`

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base (empty in dev — uses the Vite proxy) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key for checkout |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

Only `VITE_`-prefixed vars are exposed to the browser.

---

## API Overview

All routes are prefixed with `/api`. Every write route is Zod-validated before its controller.

| Mount | Access | Highlights |
|---|---|---|
| `GET /api/health` | public | Liveness check |
| `/api/auth` | public | `user/register`, `user/login`, `artisan/register`, `artisan/login`, `admin/login`, `refresh`, `logout`, `/google` + callback — rate-limited 20 req/15 min |
| `/api/products` | public | Published-only listing (q, category, price, featured, pagination), detail, reviews (GET public / POST buyer) |
| `/api/categories` | public GET, admin writes | CRUD + featured toggle + image upload |
| `/api/artisans` | public | `GET /featured` (≤6 verified), `GET /:id` (profile + published products) |
| `/api/artisan/products` | artisan | Own products w/ status filter; create (→ pending); edit pending/rejected (edit resubmits) |
| `/api/artisan/orders` | artisan | Orders containing own items; per-line-item shipped/delivered (rolls order status up) |
| `/api/artisan` | artisan | Dashboard summary (aggregations), profile + photos, notifications |
| `/api/admin/products` | admin | List all, direct publish, approve → published + notify, reject (reason) + notify, feature |
| `/api/admin/orders` | admin | List w/ status filter, update status |
| `/api/admin` | admin | Platform summary, artisan approve/feature, user list + disable (admins protected) |
| `/api/cart` | user | Get, add/update/remove items, clear, merge guest cart |
| `/api/checkout` | user | `POST /order` (Razorpay order, skips unpublished items), `POST /verify` (HMAC timing-safe → paid, clears cart) — 30 req/15 min |
| `POST /api/checkout/webhook` | Razorpay | Raw-body HMAC verified; `payment.captured` → order paid |
| `/api/orders` | user | Own order history and detail |

---

## Database Models

| Model | Key fields |
|---|---|
| **User** | name, email (unique), bcrypt password (`select:false`, optional for Google accounts), role `user\|artisan\|admin`, googleId, disabled flag, `comparePassword()` |
| **ArtisanProfile** | user (unique ref), bio, region, craft, phone, story, photos[{url, publicId}], `verified` (admin-set), `featured` |
| **Product** | artisanProfile (optional — admin listings have none), title, description, price, category (required), images[{url, publicId}], status `pending→approved/rejected→published`, rejectionReason, featured |
| **Category** | name (unique), image{url, publicId}, featured |
| **Cart** | user (unique), items[{product, quantity}] |
| **Order** | user, items[] (price/title snapshot + artisanProfile ref + per-item fulfillmentStatus), total, status `pending/paid/shipped/delivered`, paymentInfo (Razorpay ids + signature), shipping address |
| **Review** | user, product, rating 1–5, comment |
| **Notification** | user, message, read |

---

## Authentication & Security

- **JWT flow** — login returns a 15-min access token in the body; the 7-day refresh token is an httpOnly cookie scoped to `/api/auth`, rotated on refresh. Access token is held in Zustand memory and attached via the axios request interceptor.
- **Role-scoped logins** — a user login can never mint an artisan or admin token; `requireAuth` + `requireRole(...)` guard every protected route server-side. The client decodes the JWT payload purely for UI gating.
- **Disabled accounts** blocked at login; admins cannot be disabled.
- **Hardening:** helmet security headers · CORS origin allowlist (never `*`) · `express-mongo-sanitize` (NoSQL operator injection) · rate limits on auth (20/15 min) and payments (30/15 min) · Multer whitelist (JPEG/PNG/WebP, 5 MB max, ≤6 files) · timing-safe payment/webhook signature comparison · Zod validation on every write.

---

## Product Lifecycle

```
Artisan creates product ──► PENDING ──► Admin approves ──► PUBLISHED ──► visible in shop
                              │                            ▲
                              │ Admin rejects (reason)      │ Artisan edits
                              ▼                            │ (pending/rejected only)
                          REJECTED ────────────────────────┘
                                                       (resubmits as PENDING)

Admin "Direct Listing" ──► PUBLISHED immediately (bypasses moderation)
```

---

## Design System

Brand tokens defined as Tailwind theme extensions mirroring CSS variables in `client/src/index.css`:

| Token | Value | Use |
|---|---|---|
| Navy | `#1B2A4A` | Headings, primary text |
| Terracotta | `#C9622B` | Primary actions, accents |
| Cream | `#F7F2E9` | Backgrounds |
| Gold | `#C9A24B` | GI-tag / verification badges |
| Forest | `#355E3B` | Success/trust states |

Typography: **Playfair Display** (headings) + **Inter** (body). Signature motifs: "polaroid" product cards, GI-tag badges, trust strip, scroll-reveal animations (IntersectionObserver, reduced-motion aware), and an auto-hiding navbar.

---

## Testing

Integration tests live in `server/tests/` — Jest + Supertest against an in-memory MongoDB (`mongodb-memory-server`), with test JWT secrets injected by `setup.js`:

- `auth.test.js` — register / login / disabled accounts / protected-route gating
- `checkout.test.js` — order creation and payment verification
- `moderation.test.js` — the approve/reject pipeline

```bash
cd server
npm test
```

CI (`.github/workflows/ci.yml`) runs the server test suite and the client Vite build on every push/PR to `main`.

---

## Deployment

Full step-by-step guide in [DEPLOY.md](./DEPLOY.md). Summary:

| Piece | Platform | Notes |
|---|---|---|
| Client | Vercel | `client/vercel.json` SPA rewrites; set `VITE_API_BASE_URL` to the Render API URL |
| API | Render | `render.yaml` blueprint; all secrets set via dashboard (`sync: false`), `CLIENT_ORIGIN` includes the Vercel URL |
| Database | MongoDB Atlas | Connection string in Render env |
| Media | Cloudinary | Account-level config |
| Payments | Razorpay | Key pair + webhook pointing at `/api/checkout/webhook` |

Production specifics: `trust proxy` is enabled behind Render; refresh cookies switch to `SameSite=None; Secure` for the cross-domain Vercel ↔ Render setup.

---

## Documentation

| File | Contents |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | Project ground-truth spec — product vision, rules, and conventions |
| [DEPLOY.md](./DEPLOY.md) | Full deployment walkthrough |
| [VIRASAT_BUILD_PHASES.md](./VIRASAT_BUILD_PHASES.md) | The phased build plan (Phases 0–11) the MVP implements |
