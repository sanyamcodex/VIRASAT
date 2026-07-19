import cloudinary from '../config/cloudinary.js';

// Streams a validated in-memory image buffer to Cloudinary.
export const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'virasat/products', resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

export const deleteImage = (publicId) =>
  cloudinary.uploader.destroy(publicId);

// Middleware: uploads any validated files and sets req.body.images = [{url, publicId}].
export const processProductImages = async (req, res, next) => {
  try {
    // No files uploaded: leave req.body.images unset so edits keep existing images.
    if (!req.files || req.files.length === 0) return next();
    req.body.images = await Promise.all(
      req.files.map((f) => uploadBuffer(f.buffer))
    );
    next();
  } catch (err) {
    next(err);
  }
};
