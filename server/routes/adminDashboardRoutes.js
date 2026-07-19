import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getPlatformSummary,
  listArtisans,
  approveArtisan,
  featureArtisan,
  listUsers,
  setUserDisabled,
} from '../controllers/adminDashboardController.js';

const router = Router();

const disableSchema = z.object({ disabled: z.boolean() });

// Admin dashboard — admins only.
// (Product moderation is reused from /api/admin/products; category CRUD from /api/categories.)
router.use(requireAuth, requireRole('admin'));

router.get('/summary', getPlatformSummary);
router.get('/artisans', listArtisans);
router.patch('/artisans/:id/approve', approveArtisan);
router.patch('/artisans/:id/feature', featureArtisan);
router.get('/users', listUsers);
router.patch('/users/:id/disable', validate(disableSchema), setUserDisabled);

export default router;
