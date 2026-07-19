import mongoose from 'mongoose';

// Per-line-item snapshot. artisanProfile is stored so an artisan can update
// fulfillment on only the items that are theirs.
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  artisanProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'ArtisanProfile' },
  title: { type: String },
  price: { type: Number },
  quantity: { type: Number, default: 1, min: 1 },
  fulfillmentStatus: {
    type: String,
    enum: ['pending', 'shipped', 'delivered'],
    default: 'pending',
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered'],
      default: 'pending',
    },
    paymentInfo: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
    },
    shipping: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
