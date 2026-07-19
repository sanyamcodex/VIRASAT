import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeCart,
} from '../controllers/cartController.js';

const router = Router();
const OID = /^[0-9a-fA-F]{24}$/;

const addSchema = z.object({
  product: z.string().regex(OID),
  quantity: z.coerce.number().int().positive().optional(),
});
const qtySchema = z.object({ quantity: z.coerce.number().int().positive() });
const mergeSchema = z.object({
  items: z.array(
    z.object({
      product: z.string().regex(OID),
      quantity: z.coerce.number().int().positive().optional(),
    })
  ),
});

// Cart is per-user and persisted — buyers only.
router.use(requireAuth, requireRole('user'));

router.get('/', getCart);
router.post('/items', validate(addSchema), addItem);
router.patch('/items/:productId', validate(qtySchema), updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);
router.post('/merge', validate(mergeSchema), mergeCart);

export default router;
