import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { handleImageUpload } from '../middleware/upload.js';
import { processCategoryImage } from '../services/cloudinaryService.js';
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

// Admin category management. Optional image via multipart (field "images").
const admin = [requireAuth, requireRole('admin')];
router.post('/', ...admin, handleImageUpload, validate(categorySchema), processCategoryImage, createCategory);
router.patch('/:id/featured', ...admin, validate(featuredSchema), setCategoryFeatured);
router.patch('/:id', ...admin, handleImageUpload, validate(categorySchema), processCategoryImage, updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

export default router;
