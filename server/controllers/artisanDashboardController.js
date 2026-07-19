import Order from '../models/Order.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const profileFor = (userId) => ArtisanProfile.findOne({ user: userId });
const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered'];

// GET /api/artisan/summary — delivered units, revenue, orders-by-status (all via aggregation).
export const getSalesSummary = asyncHandler(async (req, res) => {
  const profile = await profileFor(req.user.sub);
  if (!profile)
    return res.status(400).json({ message: 'Artisan profile not found' });
  const profileId = profile._id;

  // Revenue + delivered units from this artisan's line items in paid+ orders.
  const [totals] = await Order.aggregate([
    { $match: { 'items.artisanProfile': profileId, status: { $in: ['paid', 'shipped', 'delivered'] } } },
    { $unwind: '$items' },
    { $match: { 'items.artisanProfile': profileId } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        deliveredUnits: {
          $sum: {
            $cond: [{ $eq: ['$items.fulfillmentStatus', 'delivered'] }, '$items.quantity', 0],
          },
        },
      },
    },
  ]);

  // Count of orders containing this artisan's items, grouped by order status.
  const grouped = await Order.aggregate([
    { $match: { 'items.artisanProfile': profileId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const ordersByStatus = ORDER_STATUSES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  grouped.forEach((g) => {
    ordersByStatus[g._id] = g.count;
  });

  res.json({
    deliveredUnits: totals?.deliveredUnits || 0,
    totalRevenue: totals?.totalRevenue || 0,
    ordersByStatus,
  });
});

// GET /api/artisan/profile — own story/profile.
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileFor(req.user.sub);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
});

// PATCH /api/artisan/profile — update bio/region/craft/story; append uploaded photos.
export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileFor(req.user.sub);
  if (!profile) return res.status(404).json({ message: 'Profile not found' });

  ['bio', 'region', 'craft', 'story'].forEach((f) => {
    if (req.body[f] !== undefined) profile[f] = req.body[f];
  });
  if (Array.isArray(req.body.photos) && req.body.photos.length)
    profile.photos.push(...req.body.photos);

  await profile.save();
  res.json(profile);
});

// GET /api/artisan/notifications — own notifications.
export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.sub }).sort({
    createdAt: -1,
  });
  res.json(notifications);
});

// PATCH /api/artisan/notifications/:id/read — mark one read.
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.sub },
    { read: true },
    { new: true }
  );
  if (!notification)
    return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
});

// PATCH /api/artisan/notifications/read-all — mark all read.
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user.sub, read: false },
    { read: true }
  );
  res.json({ updated: result.modifiedCount });
});
