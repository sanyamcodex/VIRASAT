import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import razorpay from '../config/razorpay.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const artisanProfileFor = (userId) => ArtisanProfile.findOne({ user: userId });

const safeEqual = (a, b) =>
  a.length === b.length &&
  crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Roll the order status up from its line items (only once payment has landed).
const recomputeStatus = (order) => {
  if (order.status === 'pending') return;
  const statuses = order.items.map((i) => i.fulfillmentStatus);
  if (statuses.length && statuses.every((s) => s === 'delivered'))
    order.status = 'delivered';
  else if (statuses.some((s) => s === 'shipped' || s === 'delivered'))
    order.status = 'shipped';
  else order.status = 'paid';
};

// ---------- Checkout (role=user) ----------

// POST /api/checkout/order — build a Razorpay order from the user's cart.
export const createCheckoutOrder = asyncHandler(async (req, res) => {
  if (!razorpay)
    return res.status(503).json({ message: 'Payments are not configured' });

  const cart = await Cart.findOne({ user: req.user.sub }).populate('items.product');
  if (!cart || cart.items.length === 0)
    return res.status(400).json({ message: 'Cart is empty' });

  const items = [];
  let total = 0;
  for (const it of cart.items) {
    const p = it.product;
    if (!p || p.status !== 'published') continue; // skip unavailable items
    total += p.price * it.quantity;
    items.push({
      product: p._id,
      artisanProfile: p.artisanProfile,
      title: p.title,
      price: p.price,
      quantity: it.quantity,
    });
  }
  if (items.length === 0)
    return res.status(400).json({ message: 'No purchasable items in cart' });

  const amount = Math.round(total * 100); // paise
  const rzp = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
  });

  const order = await Order.create({
    user: req.user.sub,
    items,
    total,
    status: 'pending',
    paymentInfo: { razorpayOrderId: rzp.id },
    shipping: req.body.shipping,
  });

  res.status(201).json({
    key: process.env.RAZORPAY_KEY_ID,
    razorpayOrderId: rzp.id,
    amount,
    currency: 'INR',
    orderId: order._id,
  });
});

// POST /api/checkout/verify — verify the client-side payment signature (callback).
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (!safeEqual(expected, razorpay_signature))
    return res.status(400).json({ message: 'Invalid payment signature' });

  const order = await Order.findOne({
    'paymentInfo.razorpayOrderId': razorpay_order_id,
    user: req.user.sub,
  });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.status === 'pending') {
    order.status = 'paid';
    order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
    order.paymentInfo.razorpaySignature = razorpay_signature;
    await order.save();
    await Cart.findOneAndUpdate({ user: req.user.sub }, { items: [] });
    // No stock field on Product → nothing to decrement (per phase spec).
  }
  res.json(order);
});

// POST /api/checkout/webhook — Razorpay server-to-server confirmation (raw body).
export const razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  if (!secret || !signature)
    return res.status(400).json({ message: 'Webhook not configured' });

  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.body) // raw Buffer
    .digest('hex');
  if (!safeEqual(expected, String(signature)))
    return res.status(400).json({ message: 'Invalid webhook signature' });

  const event = JSON.parse(req.body.toString());
  if (event.event === 'payment.captured') {
    const entity = event.payload?.payment?.entity;
    const rzpOrderId = entity?.order_id;
    if (rzpOrderId) {
      const order = await Order.findOne({
        'paymentInfo.razorpayOrderId': rzpOrderId,
      });
      if (order && order.status === 'pending') {
        order.status = 'paid';
        order.paymentInfo.razorpayPaymentId = entity.id;
        await order.save();
        await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
      }
    }
  }
  res.json({ received: true });
});

// ---------- Orders (role=user) ----------

// GET /api/orders — own order history.
export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.sub }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id — own order detail.
export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.sub });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// ---------- Fulfillment (role=artisan) ----------

// GET /api/artisan/orders — paid orders containing this artisan's items (items filtered to theirs).
export const listArtisanOrders = asyncHandler(async (req, res) => {
  const profile = await artisanProfileFor(req.user.sub);
  if (!profile)
    return res.status(400).json({ message: 'Artisan profile not found' });

  const orders = await Order.find({
    'items.artisanProfile': profile._id,
    status: { $in: ['paid', 'shipped', 'delivered'] },
  }).sort({ createdAt: -1 });

  const result = orders.map((o) => ({
    ...o.toObject(),
    items: o.items.filter(
      (i) => String(i.artisanProfile) === String(profile._id)
    ),
  }));
  res.json(result);
});

// PATCH /api/artisan/orders/:orderId/items/:itemId  { fulfillmentStatus }
export const updateLineItemStatus = asyncHandler(async (req, res) => {
  const profile = await artisanProfileFor(req.user.sub);
  if (!profile)
    return res.status(400).json({ message: 'Artisan profile not found' });

  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'pending')
    return res.status(409).json({ message: 'Order is not paid yet' });

  const item = order.items.id(req.params.itemId);
  if (!item || String(item.artisanProfile) !== String(profile._id))
    return res.status(403).json({ message: 'Not your order item' });

  item.fulfillmentStatus = req.body.fulfillmentStatus;
  recomputeStatus(order);
  await order.save();
  res.json(order);
});
