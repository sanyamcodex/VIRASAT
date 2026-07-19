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
  const category = await Category.create({ name: req.body.name });
  res.status(201).json(category);
});

// PATCH /api/categories/:id — admin.
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true, runValidators: true }
  );
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
});

// DELETE /api/categories/:id — admin.
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category deleted' });
});
