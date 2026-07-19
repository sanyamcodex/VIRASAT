import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { handleImageUpload } from '../middleware/upload.js';
import { processProductImages } from '../services/cloudinaryService.js';
import {
  listAllProducts,
  approveProduct,
  rejectProduct,
  updateProduct,
  createAndPublish,
} from '../controllers/productController.js';

const router = Router();

const OID = /^[0-9a-fA-F]{24}$/;
const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  category: z.string().regex(OID, 'Invalid category id'),
  artisanProfile: z.string().regex(OID).optional(),
});
const updateSchema = createSchema.partial();
const rejectSchema = z.object({ reason: z.string().min(1) });

// All routes: authenticated admins only.
router.use(requireAuth, requireRole('admin'));

router.get('/', listAllProducts);
router.post('/', handleImageUpload, validate(createSchema), processProductImages, createAndPublish);
router.patch('/:id/approve', approveProduct);
router.patch('/:id/reject', validate(rejectSchema), rejectProduct);
router.patch('/:id', handleImageUpload, validate(updateSchema), processProductImages, updateProduct);

export default router;
