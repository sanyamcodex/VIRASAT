import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listMyOrders, getMyOrder } from '../controllers/orderController.js';

// Buyer order history + detail.
const router = Router();

router.use(requireAuth, requireRole('user'));

router.get('/', listMyOrders);
router.get('/:id', getMyOrder);

export default router;
