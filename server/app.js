import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import artisanProductRoutes from './routes/artisanProductRoutes.js';
import adminProductRoutes from './routes/adminProductRoutes.js';

// Base Express app. Feature routes/controllers are added phase-by-phase.
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

configurePassport();
app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'virasat-server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/artisan/products', artisanProductRoutes);
app.use('/api/admin/products', adminProductRoutes);

// Central error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;
