import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listAllOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = Router();

const statusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered']),
});

// Admin order management.
router.use(requireAuth, requireRole('admin'));

router.get('/', listAllOrders);
router.patch('/:id/status', validate(statusSchema), updateOrderStatus);

export default router;
