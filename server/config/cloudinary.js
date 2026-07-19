import { v2 as cloudinary } from 'cloudinary';

// Reads CLOUDINARY_* from env (loaded by index.js via dotenv before this import).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
