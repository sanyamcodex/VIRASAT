# VIRASAT — Project Memory

This file is auto-read by Claude Code at the start of every session in this repo.
Do not ask me to re-explain anything below — treat it as ground truth and proceed
with sensible defaults when a detail isn't specified. Keep responses terse: summarize
what you changed (file paths + one line each), don't paste full file contents back
unless I ask, and don't re-print this file.

## Vision
VIRASAT is a marketplace connecting India's 7M+ artisans directly with buyers,
so artisans get fair prices and buyers get verified, authentic handmade goods.
Emotional connection (artisan stories) + trust signals (verification, reviews)
drive purchase decisions — this is the core differentiator, not just a shop.

## Tech Stack (locked — don't suggest alternatives mid-build)
- Frontend: React + Vite, React Router v6, Tailwind CSS, Zustand (state), Axios,
  React Hook Form + Zod (forms/validation)
- Backend: Node.js + Express, MongoDB + Mongoose
- Auth: JWT — short-lived access token (15 min, in memory/localStorage) + refresh
  token (7 days, httpOnly secure cookie); bcrypt for passwords; Google OAuth
  (passport-google-oauth20) for User login only, not artisan/admin
- Payments: Razorpay (India-native — UPI, cards, netbanking)
- Media: Cloudinary (product/artisan photos)
- Deployment target: Vercel (client), Render (server), MongoDB Atlas, GitHub Actions CI

## Repo Architecture
Monorepo, two top-level apps:
```
/client   → single React app, three route trees behind role guards
  /             public storefront (User)
  /artisan/*    protected artisan dashboard
  /admin/*      protected admin dashboard
/server   → Express REST API
  /models /controllers /routes /middleware /services /utils /config
```
One React app (not three separate apps) — simpler to deploy and share UI kit,
route guards handle role separation. RBAC middleware on the API enforces it
server-side regardless of what the client does.

## Roles & Features

### User (buyer)
- Register/login (email+password, Google OAuth), profile, addresses
- Browse: Home, Art Forms, Paintings, Textiles & Handloom, Shop — category nav
  mirrors weavehand.com structure
- Artisan story pages: bio, region, craft heritage, photos, their products
- Product detail, search, filters, wishlist, ratings/reviews
- Cart: persistent per-user, guest cart merges into account cart on login
- Checkout → Razorpay → order confirmation
- Order history + status tracking

### Artisan
- Registration → held as "pending" until admin verifies/approves
- Dashboard: units delivered, total sales revenue, order status breakdown (chart)
- Upload product: images, title, description, price, category → status starts
  "pending", goes to admin moderation queue, not live until approved
- Edit own story/profile page content
- View + update fulfillment status on their own order line items
- In-app notifications on approval/rejection (with reason if rejected)

### Admin
- Dashboard: platform-wide sales, order volume, revenue, active artisan count
- Order management: view all orders, update status, filter/search
- Moderation queue: review pending artisan product submissions, edit fields,
  approve (→ published, visible to users) or reject (with reason, notifies artisan)
- Artisan management: approve new artisan signups, view per-artisan performance
- Direct listing: admin can create/publish products directly, bypassing the queue
- User management, category management, homepage content curation
- Note: "chat with artisan" request is implemented as an async moderation queue
  with comments/reason field in v1 — not real-time chat. Flag if you actually
  want real-time chat (Socket.io); it's a bigger scope addition, do it as a
  separate later phase, not bundled into MVP moderation.

## Design System (WeaveHand-inspired, VIRASAT branding)
- Colors: deep navy `#1B2A4A` (primary/nav), terracotta `#C9622B` (accent/CTA),
  warm cream `#F7F2E9` (background), muted gold `#C9A24B` (highlights/badges)
- Type: serif display for headings (Playfair Display), Inter for body
- UI motifs: polaroid-style product/story cards, "GI Tag"-style verified badges,
  trust strip (reviews %, verified artisan count), heritage/handmade framing
  in hero sections — reference the uploaded WeaveHand screenshots for layout,
  but all copy, logo, and imagery must be original VIRASAT branding

## Data Models (high-level — expand fields as needed per phase, don't over-build early)
`User` (role: user|artisan|admin, auth fields), `ArtisanProfile` (ref User; bio,
region, craft, story, verified bool), `Product` (ref ArtisanProfile, status:
pending|approved|rejected|published), `Category`, `Cart`, `Order` (items,
status, paymentInfo, shipping), `Review`, `Notification`.

## Security & NFRs (non-negotiable, build in from Phase 1, not bolted on later)
- Rate limiting on auth + payment routes, helmet, CORS allowlist (not `*`)
- Input validation on every route (Joi or Zod) — reject before hitting controller
- RBAC middleware checked server-side on every protected route
- File upload: type + size whitelist before Cloudinary upload
- No secrets in code — `.env` + `.env.example`, secrets never committed
- Admin account is seeded via script, never publicly registerable

## Working Agreement
- Build phase-by-phase using VIRASAT_BUILD_PHASES.md prompts, one phase per session
- Commit at the end of each phase with a clear conventional-commit message
- If something in a phase prompt conflicts with this file, this file wins
- Don't scaffold features from later phases early — keep each phase's diff scoped