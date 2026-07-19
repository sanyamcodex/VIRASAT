import rateLimit from 'express-rate-limit';

// Rate limiter for auth routes (CLAUDE.md: rate limit auth + payment routes).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});
