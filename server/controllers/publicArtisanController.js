import ArtisanProfile from '../models/ArtisanProfile.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const OID = /^[0-9a-fA-F]{24}$/;

// GET /api/artisans/:id — public artisan story page: verified profile + their
// published products.
export const getArtisanPublic = asyncHandler(async (req, res) => {
  if (!OID.test(req.params.id))
    return res.status(404).json({ message: 'Artisan not found' });
  const profile = await ArtisanProfile.findOne({
    _id: req.params.id,
    verified: true,
  }).populate('user', 'name');
  if (!profile) return res.status(404).json({ message: 'Artisan not found' });

  const products = await Product.find({
    artisanProfile: profile._id,
    status: 'published',
  }).populate('category', 'name');

  res.json({ profile, products });
});
