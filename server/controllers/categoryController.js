import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/categories — public.
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// POST /api/categories — admin.
export const createCategory = asyncHandler(async (req, res) => {
  if (await Category.findOne({ name: req.body.name }))
    return res.status(409).json({ message: 'Category already exists' });
  const category = await Category.create({
    name: req.body.name,
    ...(req.body.image ? { image: req.body.image } : {}),
  });
  res.status(201).json(category);
});

// PATCH /api/categories/:id — admin.
export const updateCategory = asyncHandler(async (req, res) => {
  const update = { name: req.body.name };
  if (req.body.image) update.image = req.body.image; // keep existing if none uploaded
  const category = await Category.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
});

// DELETE /api/categories/:id — admin.
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category deleted' });
});

// PATCH /api/categories/:id/featured — homepage curation toggle (admin).
export const setCategoryFeatured = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { featured: req.body.featured },
    { new: true }
  );
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
});
