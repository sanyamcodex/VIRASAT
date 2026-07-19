import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Not required for Google-authenticated users.
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: function () {
        return !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ['user', 'artisan', 'admin'],
      default: 'user',
    },
    googleId: { type: String },
    // Admin can disable an account (blocks login). Admins can't be disabled.
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
