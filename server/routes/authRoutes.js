import { Router } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import * as auth from '../controllers/authController.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Rate-limit every auth route.
router.use(authLimiter);

router.post('/user/register', validate(registerSchema), auth.registerUser);
router.post('/user/login', validate(loginSchema), auth.loginUser);
router.post('/artisan/register', validate(registerSchema), auth.registerArtisan);
router.post('/artisan/login', validate(loginSchema), auth.loginArtisan);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);

// Google OAuth — User login only. Active once GOOGLE_* env vars are set.
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  auth.googleCallback
);

export default router;
