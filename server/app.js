import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import artisanProductRoutes from './routes/artisanProductRoutes.js';
import adminProductRoutes from './routes/adminProductRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import artisanOrderRoutes from './routes/artisanOrderRoutes.js';
import artisanDashboardRoutes from './routes/artisanDashboardRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import artisanPublicRoutes from './routes/artisanPublicRoutes.js';
import { razorpayWebhook } from './controllers/orderController.js';

// Base Express app. Feature routes/controllers are added phase-by-phase.
const app = express();

app.use(helmet());

// CORS allowlist (never `*`). CLIENT_ORIGIN may be a comma-separated list.
// Non-browser requests (no Origin) and dev localhost are allowed.
const allowlist = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin))
        return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Razorpay webhook needs the raw body for signature verification — mount it
// BEFORE the JSON parser.
app.post(
  '/api/checkout/webhook',
  express.raw({ type: 'application/json' }),
  razorpayWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Strip keys containing `$`/`.` from body/query/params — blocks NoSQL operator injection.
app.use(mongoSanitize());

configurePassport();
app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'virasat-server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/artisans', artisanPublicRoutes);
app.use('/api/artisan/products', artisanProductRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/artisan/orders', artisanOrderRoutes);
// Mounted after the more specific /api/artisan/* routes above.
app.use('/api/artisan', artisanDashboardRoutes);
// Mounted after the more specific /api/admin/products routes above.
app.use('/api/admin', adminDashboardRoutes);

// JSON 404 for unmatched API routes.
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Central error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;
