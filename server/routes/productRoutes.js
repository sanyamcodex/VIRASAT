import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listProducts, getProduct } from '../controllers/productController.js';
import {
  listProductReviews,
  createReview,
} from '../controllers/reviewController.js';

// Public catalog — only published products are visible here.
const router = Router();

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

router.get('/', listProducts);
router.get('/:id', getProduct);

// Reviews (public read; buyers may post).
router.get('/:id/reviews', listProductReviews);
router.post('/:id/reviews', requireAuth, requireRole('user'), validate(reviewSchema), createReview);

export default router;
