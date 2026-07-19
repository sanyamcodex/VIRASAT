import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paymentLimiter } from '../middleware/rateLimit.js';
import {
  createCheckoutOrder,
  verifyPayment,
} from '../controllers/orderController.js';

const router = Router();

const createSchema = z.object({
  shipping: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(1),
  }),
});
const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// Payment routes: buyers only, rate-limited. (Webhook is mounted in app.js with a raw body.)
router.use(paymentLimiter, requireAuth, requireRole('user'));

router.post('/order', validate(createSchema), createCheckoutOrder);
router.post('/verify', validate(verifySchema), verifyPayment);

export default router;
