import cloudinary from 'cloudinary';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload a single image (featured or inline)
// @route   POST /api/uploads
// @access  Private
export const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Validate mime type
  if (!req.file.mimetype.startsWith('image/')) {
    return next(new ErrorResponse('Only image files are allowed', 400));
  }

  // Convert buffer to base64 data URI for Cloudinary
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  // Upload to Cloudinary
  const result = await cloudinary.v2.uploader.upload(dataURI, {
    folder: 'wittymart/posts',
    width: 1600,
    crop: 'limit',
    quality: 'auto:good',
    fetch_format: 'auto',
  });

  res.status(200).json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  });
});

// @desc    Delete an image from Cloudinary (optional, for cleanup)
// @route   DELETE /api/uploads/:publicId
// @access  Private
export const deleteImage = asyncHandler(async (req, res, next) => {
  const { publicId } = req.params;

  if (!publicId) {
    return next(new ErrorResponse('publicId is required', 400));
  }

  await cloudinary.v2.uploader.destroy(publicId);

  res.status(200).json({ success: true, message: 'Image deleted' });
});
