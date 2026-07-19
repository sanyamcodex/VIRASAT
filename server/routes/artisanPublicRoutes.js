import { Router } from 'express';
import { getArtisanPublic } from '../controllers/publicArtisanController.js';

// Public artisan story pages.
const router = Router();

router.get('/:id', getArtisanPublic);

export default router;
