import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { handlePhotoUpload } from '../middleware/upload.js';
import { processProfilePhotos } from '../services/cloudinaryService.js';
import {
  getSalesSummary,
  getProfile,
  updateProfile,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/artisanDashboardController.js';

const router = Router();

const profileSchema = z.object({
  bio: z.string().optional(),
  region: z.string().optional(),
  craft: z.string().optional(),
  story: z.string().optional(),
});

// Artisan dashboard — authenticated artisans only.
// (Own product list with status filter is already served by /api/artisan/products.)
router.use(requireAuth, requireRole('artisan'));

router.get('/summary', getSalesSummary);
router.get('/profile', getProfile);
router.patch('/profile', handlePhotoUpload, validate(profileSchema), processProfilePhotos, updateProfile);

router.get('/notifications', listNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
