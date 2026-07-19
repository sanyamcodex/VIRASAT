import { Router } from 'express';
import {
  getArtisanPublic,
  getFeaturedArtisans,
} from '../controllers/publicArtisanController.js';

// Public artisan story pages.
const router = Router();

router.get('/featured', getFeaturedArtisans); // before /:id so it isn't treated as an id
router.get('/:id', getArtisanPublic);

export default router;
