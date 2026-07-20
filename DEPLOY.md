# Deploying VIRASAT

Client → **Vercel** · API → **Render** · DB → **MongoDB Atlas** · media → **Cloudinary** · payments → **Razorpay**.
CI (`.github/workflows/ci.yml`) runs server tests + a client build on every PR to `main` — no secrets required.

All secrets live in each host's dashboard. **Nothing secret is committed** (`.env` is gitignored; `render.yaml` uses `sync: false`).

---

## 1. Accounts to create
MongoDB Atlas · Cloudinary · Razorpay · Render · Vercel. (Google OAuth is optional.)

## 2. MongoDB Atlas
1. Create a free cluster + a database user (username/password).
2. Network Access → allow `0.0.0.0/0` (or Render's outbound IPs).
3. Copy the connection string and **add a database name**, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/virasat?retryWrites=true&w=majority` → this is `MONGODB_URI`.

## 3. Cloudinary
Dashboard → copy **Cloud name**, **API Key**, **API Secret** → `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`.

## 4. Razorpay
1. Settings → API Keys → generate **Key ID** + **Key Secret** → `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
   (`RAZORPAY_KEY_ID` also goes to the client as `VITE_RAZORPAY_KEY_ID`.)
2. Settings → Webhooks → add `https://<your-render-app>.onrender.com/api/checkout/webhook`,
   subscribe to `payment.captured`, set a secret → `RAZORPAY_WEBHOOK_SECRET`.

## 5. Deploy the API on Render
1. New → **Blueprint** → pick this repo (uses `render.yaml`, `rootDir: server`).
2. In the service's **Environment** tab set every `sync: false` var:
   - `MONGODB_URI`, `CLIENT_ORIGIN` (your Vercel URL — fill after step 6, then redeploy),
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (generate long random strings, e.g. `openssl rand -base64 48`),
   - `RAZORPAY_*`, `CLOUDINARY_*`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   - `GOOGLE_*` (only if using Google login).
   `NODE_ENV`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES` come from `render.yaml`. Don't set `PORT` — Render injects it.
3. Deploy. Health check: `https://<render-app>.onrender.com/api/health` → `{"status":"ok"}`.

## 6. Deploy the client on Vercel
1. Import the repo → **Root Directory = `client`** (Vercel auto-detects Vite; `client/vercel.json` handles SPA routing).
2. Environment Variables:
   - `VITE_API_BASE_URL` = `https://<render-app>.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay Key ID
   - `VITE_GOOGLE_CLIENT_ID` = your Google client id (only if using Google login)
3. Deploy → note the URL, e.g. `https://virasat.vercel.app`.

## 7. Wire the two together
- Set the API's `CLIENT_ORIGIN` to the exact Vercel URL (comma-separate if several) and **redeploy the API**.
  This is required for CORS **and** for the cross-site refresh cookie (`SameSite=None; Secure`) to work.

## 8. Seed the admin account
Admins can't self-register. Once `MONGODB_URI` + `ADMIN_EMAIL` + `ADMIN_PASSWORD` are set, run once:
- Render → the service → **Shell**: `npm run seed:admin`, **or**
- locally: `cd server && MONGODB_URI=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin`.
Then log in at `https://<vercel-app>/admin/login`.

## 9. Google OAuth (optional)
Google Cloud Console → OAuth client (Web). Authorized redirect URI:
`https://<render-app>.onrender.com/api/auth/google/callback`. Set `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` (same URL) on Render; `VITE_GOOGLE_CLIENT_ID` on Vercel.
Leave these blank to disable Google login (email/password still works).

---

### Notes
- Render free tier sleeps when idle — the first request after a while is slow (cold start).
- Razorpay **test** keys are fine for a staging deploy; swap for live keys to take real payments.
- After changing any server env var, redeploy the Render service for it to take effect.
