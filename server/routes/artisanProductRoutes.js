import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { handleImageUpload } from '../middleware/upload.js';
import { processProductImages } from '../services/cloudinaryService.js';
import {
  createProduct,
  updateOwnProduct,
  listOwnProducts,
} from '../controllers/productController.js';

const router = Router();

const OID = /^[0-9a-fA-F]{24}$/;
const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  category: z.string().regex(OID, 'Invalid category id'),
});
const updateSchema = createSchema.partial();

// All routes: authenticated artisans only.
router.use(requireAuth, requireRole('artisan'));

router.get('/', listOwnProducts);
// multipart: parse+validate images (type/size) → upload to Cloudinary → validate fields.
router.post('/', handleImageUpload, validate(createSchema), processProductImages, createProduct);
router.patch('/:id', handleImageUpload, validate(updateSchema), processProductImages, updateOwnProduct);

export default router;
