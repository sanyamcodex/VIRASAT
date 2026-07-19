import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const OID = /^[0-9a-fA-F]{24}$/;
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Fields an artisan/admin may set on a product (never status/rejectionReason directly).
const EDITABLE = ['title', 'description', 'price', 'category', 'images'];
const pickEditable = (body) =>
  EDITABLE.reduce((acc, k) => {
    if (body[k] !== undefined) acc[k] = body[k];
    return acc;
  }, {});

const artisanProfileFor = (userId) => ArtisanProfile.findOne({ user: userId });

// ---------- Public ----------

// GET /api/products — only published; filter by category/price, search title/description.
export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const filter = { status: 'published' };
  if (category && OID.test(String(category))) filter.category = String(category);
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (q) {
    const rx = new RegExp(escapeRegExp(String(q)), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }
  if (req.query.featured === 'true') filter.featured = true; // homepage curation

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name')
      .populate('artisanProfile', 'region craft')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/products/:id — published only for the public.
export const getProduct = asyncHandler(async (req, res) => {
  if (!OID.test(req.params.id))
    return res.status(404).json({ message: 'Product not found' });
  const product = await Product.findOne({
    _id: req.params.id,
    status: 'published',
  })
    .populate('category', 'name')
    .populate('artisanProfile', 'bio region craft story');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// ---------- Artisan (role=artisan) ----------

// POST /api/artisan/products — always created as pending.
export const createProduct = asyncHandler(async (req, res) => {
  const profile = await artisanProfileFor(req.user.sub);
  if (!profile)
    return res.status(400).json({ message: 'Artisan profile not found' });

  const product = await Product.create({
    ...pickEditable(req.body),
    artisanProfile: profile._id,
    status: 'pending',
  });
  res.status(201).json(product);
});

// PATCH /api/artisan/products/:id — only own products, only while pending/rejected.
export const updateOwnProduct = asyncHandler(async (req, res) => {
  const profile = await artisanProfileFor(req.user.sub);
  if (!profile)
    return res.status(400).json({ message: 'Artisan profile not found' });

  const product = await Product.findOne({
    _id: req.params.id,
    artisanProfile: profile._id,
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (!['pending', 'rejected'].includes(product.status))
    return res
      .status(409)
      .json({ message: 'Only pending or rejected products can be edited' });

  Object.assign(product, pickEditable(req.body));
  // Editing a rejected product resubmits it to the moderation queue.
  if (product.status === 'rejected') {
    product.status = 'pending';
    product.rejectionReason = undefined;
  }
  await product.save();
  res.json(product);
});

// GET /api/artisan/products — own products, optional ?status filter.
export const listOwnProducts = asyncHandler(async (req, res) => {
  const profile = await artisanProfileFor(req.user.sub);
  if (!profile)
    return res.status(400).json({ message: 'Artisan profile not found' });

  const filter = { artisanProfile: profile._id };
  if (req.query.status) filter.status = String(req.query.status);
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

// ---------- Admin (role=admin) ----------

// GET /api/admin/products — all products, optional ?status filter.
export const listAllProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);
  const products = await Product.find(filter)
    .populate('category', 'name')
    .populate('artisanProfile', 'region craft')
    .sort({ createdAt: -1 });
  res.json(products);
});

// PATCH /api/admin/products/:id/approve → published (+ notify artisan).
export const approveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    'artisanProfile',
    'user'
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.status = 'published';
  product.rejectionReason = undefined;
  await product.save();

  if (product.artisanProfile?.user) {
    await Notification.create({
      user: product.artisanProfile.user,
      message: `Your product "${product.title}" was approved and is now live.`,
    });
  }
  res.json(product);
});

// PATCH /api/admin/products/:id/reject — reason required, notify artisan.
export const rejectProduct = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const product = await Product.findById(req.params.id).populate(
    'artisanProfile',
    'user'
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });

  product.status = 'rejected';
  product.rejectionReason = reason;
  await product.save();

  if (product.artisanProfile?.user) {
    await Notification.create({
      user: product.artisanProfile.user,
      message: `Your product "${product.title}" was rejected: ${reason}`,
    });
  }
  res.json(product);
});

// PATCH /api/admin/products/:id — edit any product.
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    pickEditable(req.body),
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// PATCH /api/admin/products/:id/featured — homepage curation toggle.
export const setProductFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { featured: req.body.featured },
    { new: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// POST /api/admin/products — create and publish directly, bypassing moderation.
export const createAndPublish = asyncHandler(async (req, res) => {
  const data = { ...pickEditable(req.body), status: 'published' };
  if (req.body.artisanProfile && OID.test(String(req.body.artisanProfile)))
    data.artisanProfile = req.body.artisanProfile;
  const product = await Product.create(data);
  res.status(201).json(product);
});
