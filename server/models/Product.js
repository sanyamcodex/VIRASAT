import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    artisanProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtisanProfile',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'published'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
