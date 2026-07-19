# VIRASAT — Build Phases & Prompts

How to use: put `CLAUDE.md` at the repo root first (Claude Code reads it
automatically). Then open a **new session per phase** and paste that phase's
prompt as-is. Don't paste multiple phases into one session — context bloat is
the main token cost, and each phase is scoped to close cleanly and commit.

Each prompt already assumes CLAUDE.md is loaded — that's why they're short.
Don't add background; if Opus asks a clarifying question that CLAUDE.md
already answers, just say "see CLAUDE.md" instead of re-explaining.

---

## Phase 0 — Scaffold

```
Read CLAUDE.md. Scaffold the repo exactly per the Architecture section:
/client (Vite + React + Tailwind, configured with the color/type tokens from
the Design System section as CSS variables/Tailwind theme) and /server
(Express + Mongoose, folder structure as listed). Install the packages named
in Tech Stack, add nodemon + concurrently for dev, .env.example with all
required keys (no values), .gitignore. Do not write any feature/business
logic yet. Output only a file tree and a 3-line summary. Commit as
"chore: scaffold client/server".
```

## Phase 1 — Models + Auth (all 3 roles)

```
Per CLAUDE.md: create the Mongoose models listed in Data Models (minimal
fields — id, timestamps, the fields explicitly named; don't invent extra
fields). Build auth: register/login/refresh/logout for User and Artisan,
bcrypt hashing, JWT access+refresh per the Auth section, RBAC middleware
(requireRole('user'|'artisan'|'admin')). Add a one-time seed script for the
admin account (no public admin registration route). Stub Google OAuth for
User login (route + passport config, can be untested if no client ID yet).
Don't build any product/order logic. List files touched with a 1-line
summary each, no code dumps. Commit as "feat: auth + core models".
```

## Phase 2 — Product & Catalog API

```
Per CLAUDE.md: build Product and Category CRUD endpoints. Public: list/filter/
search products (only status=published visible), get product by id, list
categories. Artisan (auth, role=artisan): create product (status defaults to
"pending"), edit own pending/rejected products, list own products. Admin
(auth, role=admin): list all products by status, approve (→published), reject
(with reason, notify via Notification model), edit any product, create+
publish directly. Add Cloudinary upload middleware for product images
(type/size validated). File-list summary only, no code dumps. Commit as
"feat: product catalog + moderation API".
```

## Phase 3 — Cart, Orders, Razorpay

```
Per CLAUDE.md: build Cart (per-user, persisted; merge guest cart into user
cart on login) and Order endpoints. Checkout flow: create Razorpay order →
verify payment signature webhook/callback → create Order (status: pending→
paid→shipped→delivered) → decrement/track stock if you added a stock field,
else skip. Artisan can update status only on order line-items containing
their own products. User can view own order history + status. Add rate
limiting to payment routes. File-list summary only. Commit as
"feat: cart + orders + Razorpay checkout".
```

## Phase 4 — Artisan Dashboard API

```
Per CLAUDE.md: add artisan-only endpoints: sales summary (total delivered
units, total revenue, orders by status — aggregate queries, don't fetch and
sum in JS), own product list with status filter, own profile/story CRUD
(ArtisanProfile: bio, region, craft, story, photos). Add Notification
list/mark-read endpoints for artisan. File-list summary only. Commit as
"feat: artisan dashboard API".
```

## Phase 5 — Admin Dashboard API

```
Per CLAUDE.md: add admin-only endpoints: platform sales/order/revenue/
active-artisan aggregates, artisan approval (approve pending ArtisanProfile
→ verified=true), user management (list/disable), category CRUD, homepage
curation (featured products/categories flag). Reuse the moderation endpoints
from Phase 2 — don't duplicate. File-list summary only. Commit as
"feat: admin dashboard API".
```

## Phase 6 — Frontend Design System & Shell

```
Per CLAUDE.md Design System: build the shared UI kit in /client (Button,
Card, Badge, Input, Navbar, Footer, ProtectedRoute wrapper for role guards)
using the Tailwind theme tokens already configured in Phase 0. Build the
three route shells (storefront layout, artisan dashboard layout, admin
dashboard layout) with placeholder pages only — no data fetching yet. Wire
up React Router with the three route trees and auth context (login state,
role, token refresh on 401). File-list summary only, no full JSX dumps.
Commit as "feat: frontend shell + design system".
```

## Phase 7 — Storefront Pages (User)

```
Per CLAUDE.md: build the User-facing pages against the Phase 2/3 APIs: Home
(hero, category browse, featured products), Art Forms/category listing with
filters, Product detail (with artisan story snippet + reviews), Artisan
story page, Cart, Checkout (Razorpay), Order history, Login/Register
(+ Google OAuth button), Wishlist. Match the WeaveHand reference layout
patterns (polaroid cards, trust strip, hero style) with VIRASAT branding —
don't reuse WeaveHand copy or logo. File-list summary only. Commit as
"feat: storefront pages".
```

## Phase 8 — Artisan Dashboard (Frontend)

```
Per CLAUDE.md: build artisan dashboard pages against Phase 4 API: sales
summary (charts for revenue/orders — use a lightweight lib, e.g. recharts),
product list with status badges, product upload/edit form (image upload to
Cloudinary via signed request), story/profile editor, notifications panel,
order fulfillment status updater. File-list summary only. Commit as
"feat: artisan dashboard frontend".
```

## Phase 9 — Admin Dashboard (Frontend)

```
Per CLAUDE.md: build admin dashboard pages against Phase 5 API: platform
analytics overview, order management table (filter/update status),
moderation queue (approve/reject with reason, inline edit before publish),
artisan approval list, direct product listing form, user/category
management. File-list summary only. Commit as "feat: admin dashboard
frontend".
```

## Phase 10 — Security Hardening & Tests

```
Per CLAUDE.md Security section: audit every route for RBAC + validation
coverage, add helmet/CORS allowlist/rate limiting if any route is missing
it, add input sanitization against NoSQL injection, verify JWT expiry/
refresh flow end-to-end, add basic integration tests for auth, checkout, and
moderation flows (Jest + Supertest). Report gaps found as a short checklist,
fix them, don't re-explain code that's already correct. Commit as
"chore: security hardening + tests".
```

## Phase 11 — Deployment

```
Per CLAUDE.md: add production configs — client env vars for API base URL,
server CORS for the deployed client origin, MongoDB Atlas connection string
via env, Cloudinary/Razorpay live keys via env (not committed), a GitHub
Actions workflow that runs tests on PR, Vercel config for /client, and a
render.yaml or equivalent for /server. Write a short DEPLOY.md with the
manual steps I still need to do myself (creating accounts, setting secrets
in each dashboard). Commit as "chore: deployment config".
```

---

## Token-efficiency notes (why these prompts are shaped this way)
- Every prompt leans on CLAUDE.md instead of restating context — that file is
  read once per session, not once per message.
- Each phase is scoped to one concern so Opus doesn't explore the whole repo.
- "File-list summary only, no code dumps" stops it from re-printing large
  files back to you in the response — that's most of the token cost on a
  big scaffold/CRUD phase.
- One phase per session avoids ballooning context from earlier phases'
  diffs sitting in the conversation.
- If a phase stalls or drifts, start a fresh session rather than correcting
  in-place for many turns — corrections in a long thread cost more than a
  clean restart with the same prompt plus one line about what went wrong.