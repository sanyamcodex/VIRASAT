import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    // Homepage curation flag (admin-controlled).
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
