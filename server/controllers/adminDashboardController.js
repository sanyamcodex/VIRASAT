import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered'];

// GET /api/admin/summary — platform-wide sales / orders / revenue / active artisans.
export const getPlatformSummary = asyncHandler(async (req, res) => {
  const [rev] = await Order.aggregate([
    { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
  ]);

  const grouped = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const ordersByStatus = ORDER_STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  grouped.forEach((g) => {
    ordersByStatus[g._id] = g.count;
  });

  const [orderCount, activeArtisans, pendingArtisans, publishedProducts, userCount] =
    await Promise.all([
      Order.countDocuments(),
      ArtisanProfile.countDocuments({ verified: true }),
      ArtisanProfile.countDocuments({ verified: false }),
      Product.countDocuments({ status: 'published' }),
      User.countDocuments({ role: 'user' }),
    ]);

  res.json({
    totalRevenue: rev?.totalRevenue || 0,
    orderCount,
    ordersByStatus,
    activeArtisans,
    pendingArtisans,
    publishedProducts,
    userCount,
  });
});

// GET /api/admin/artisans?status=pending|verified — artisan list with owner info.
export const listArtisans = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status === 'pending') filter.verified = false;
  else if (req.query.status === 'verified') filter.verified = true;
  const artisans = await ArtisanProfile.find(filter)
    .populate('user', 'name email disabled')
    .sort({ createdAt: -1 });
  res.json(artisans);
});

// PATCH /api/admin/artisans/:id/approve — verify a pending artisan (+ notify).
export const approveArtisan = asyncHandler(async (req, res) => {
  const profile = await ArtisanProfile.findByIdAndUpdate(
    req.params.id,
    { verified: true },
    { new: true }
  );
  if (!profile) return res.status(404).json({ message: 'Artisan not found' });
  await Notification.create({
    user: profile.user,
    message: 'Your artisan account has been approved. You can now sell on VIRASAT.',
  });
  res.json(profile);
});

// PATCH /api/admin/artisans/:id/feature — toggle homepage featured flag.
export const featureArtisan = asyncHandler(async (req, res) => {
  const profile = await ArtisanProfile.findById(req.params.id);
  if (!profile) return res.status(404).json({ message: 'Artisan not found' });
  profile.featured = !profile.featured;
  await profile.save();
  res.json({ id: profile._id, featured: profile.featured });
});

// GET /api/admin/users?role= — user list (passwords excluded by schema).
export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = String(req.query.role);
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(users);
});

// PATCH /api/admin/users/:id/disable  { disabled } — enable/disable a user.
export const setUserDisabled = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin')
    return res.status(403).json({ message: 'Cannot disable an admin account' });
  user.disabled = req.body.disabled;
  await user.save();
  res.json({ id: user._id, disabled: user.disabled });
});
