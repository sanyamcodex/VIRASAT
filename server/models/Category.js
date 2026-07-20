import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    // Homepage curation flag (admin-controlled).
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
