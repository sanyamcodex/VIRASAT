import cloudinary from '../config/cloudinary.js';

// Streams a validated in-memory image buffer to Cloudinary.
export const uploadBuffer = (buffer, folder = 'virasat/products') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

export const deleteImage = (publicId) => cloudinary.uploader.destroy(publicId);

// Builds a middleware that uploads any validated files and sets req.body[field].
// No files → leaves req.body[field] unset so edits keep existing media.
const makeImageProcessor = (field, folder) => async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next();
    req.body[field] = await Promise.all(
      req.files.map((f) => uploadBuffer(f.buffer, folder))
    );
    next();
  } catch (err) {
    next(err);
  }
};

export const processProductImages = makeImageProcessor('images', 'virasat/products');
export const processProfilePhotos = makeImageProcessor('photos', 'virasat/artisans');
