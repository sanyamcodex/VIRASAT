import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/productController.js';

// Public catalog — only published products are visible here.
const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

export default router;
