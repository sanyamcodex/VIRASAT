import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryFeatured,
} from '../controllers/categoryController.js';

const router = Router();

const categorySchema = z.object({ name: z.string().min(1) });
const featuredSchema = z.object({ featured: z.boolean() });

router.get('/', listCategories); // public

// Admin category management.
router.post('/', requireAuth, requireRole('admin'), validate(categorySchema), createCategory);
router.patch('/:id/featured', requireAuth, requireRole('admin'), validate(featuredSchema), setCategoryFeatured);
router.patch('/:id', requireAuth, requireRole('admin'), validate(categorySchema), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

export default router;
