import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // Optional: admin "direct listings" have no owning artisan.
    artisanProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
    },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'published'],
      default: 'pending',
    },
    // Set when an admin rejects; surfaced to the artisan so they can fix + resubmit.
    rejectionReason: { type: String },
    // Homepage curation flag (admin-controlled).
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
