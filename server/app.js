import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'virasat-server' });
});

// Routes mounted here in later phases:
// app.use('/api/auth', authRoutes) ...

export default app;
