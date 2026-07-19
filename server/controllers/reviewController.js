import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const OID = /^[0-9a-fA-F]{24}$/;

// GET /api/products/:id/reviews — public: reviews + average rating.
export const listProductReviews = asyncHandler(async (req, res) => {
  if (!OID.test(req.params.id))
    return res.status(404).json({ message: 'Product not found' });
  const reviews = await Review.find({ product: req.params.id })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  res.json({ reviews, count, average });
});

// POST /api/products/:id/reviews — auth user: leave a rating + comment.
export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, status: 'published' });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const review = await Review.create({
    user: req.user.sub,
    product: product._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });
  res.status(201).json(await review.populate('user', 'name'));
});
