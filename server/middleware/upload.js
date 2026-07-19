import multer from 'multer';

// Type + size whitelist enforced BEFORE any Cloudinary upload (CLAUDE.md security).
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
const MAX_FILES = 6;

const base = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: MAX_FILES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG or WebP images are allowed'));
  },
});

// Runs multer for the given multipart field and turns its errors into a 400.
const makeUploader = (field) => {
  const mw = base.array(field, MAX_FILES);
  return (req, res, next) =>
    mw(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
};

export const handleImageUpload = makeUploader('images'); // product images
export const handlePhotoUpload = makeUploader('photos'); // artisan story photos
