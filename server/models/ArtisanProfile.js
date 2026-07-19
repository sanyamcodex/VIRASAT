import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: { type: String },
    region: { type: String },
    craft: { type: String },
    story: { type: String },
    photos: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    // Stays false until an admin verifies the artisan (Phase 5).
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ArtisanProfile', artisanProfileSchema);
