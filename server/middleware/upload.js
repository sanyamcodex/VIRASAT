import multer from 'multer';

// Type + size whitelist enforced BEFORE any Cloudinary upload (CLAUDE.md security).
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
const MAX_FILES = 6;

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG or WebP images are allowed'));
  },
}).array('images', MAX_FILES);

// Runs multer and converts its errors (bad type / too large) into a 400.
export const handleImageUpload = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};
