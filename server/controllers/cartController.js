import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const withProducts = (cart) =>
  cart.populate({ path: 'items.product', select: 'title price images status' });

const isPurchasable = (p) => p && p.status === 'published';

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.sub);
  res.json(await withProducts(cart));
});

// POST /api/cart/items  { product, quantity? }
export const addItem = asyncHandler(async (req, res) => {
  const { product, quantity = 1 } = req.body;
  if (!isPurchasable(await Product.findById(product)))
    return res.status(400).json({ message: 'Product is not available' });

  const cart = await getOrCreateCart(req.user.sub);
  const existing = cart.items.find((i) => String(i.product) === String(product));
  if (existing) existing.quantity += quantity;
  else cart.items.push({ product, quantity });
  await cart.save();
  res.status(201).json(await withProducts(cart));
});

// PATCH /api/cart/items/:productId  { quantity }
export const updateItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.sub);
  const item = cart.items.find((i) => String(i.product) === req.params.productId);
  if (!item) return res.status(404).json({ message: 'Item not in cart' });
  item.quantity = req.body.quantity;
  await cart.save();
  res.json(await withProducts(cart));
});

// DELETE /api/cart/items/:productId
export const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.sub);
  cart.items = cart.items.filter(
    (i) => String(i.product) !== req.params.productId
  );
  await cart.save();
  res.json(await withProducts(cart));
});

// DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.sub);
  cart.items = [];
  await cart.save();
  res.json(cart);
});

// POST /api/cart/merge  { items: [{ product, quantity }] } — guest cart → user cart on login.
export const mergeCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.sub);
  for (const g of req.body.items) {
    if (!isPurchasable(await Product.findById(g.product))) continue;
    const existing = cart.items.find(
      (i) => String(i.product) === String(g.product)
    );
    if (existing) existing.quantity += g.quantity || 1;
    else cart.items.push({ product: g.product, quantity: g.quantity || 1 });
  }
  await cart.save();
  res.json(await withProducts(cart));
});
