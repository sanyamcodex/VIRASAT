import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

// One-time admin seed. There is no public admin registration route — run this
// with ADMIN_EMAIL / ADMIN_PASSWORD set: `npm run seed:admin`.
const run = async () => {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  await connectDB(MONGODB_URI);
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: 'VIRASAT Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin seeded: ${ADMIN_EMAIL}`);
  }
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
