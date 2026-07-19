import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  listArtisanOrders,
  updateLineItemStatus,
} from '../controllers/orderController.js';

const router = Router();

const statusSchema = z.object({
  fulfillmentStatus: z.enum(['shipped', 'delivered']),
});

// Artisans see + fulfill only their own line items.
router.use(requireAuth, requireRole('artisan'));

router.get('/', listArtisanOrders);
router.patch('/:orderId/items/:itemId', validate(statusSchema), updateLineItemStatus);

export default router;
