import express from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../controllers/uploads.js';
import { protect } from '../middleware/Auth.js';

const router = express.Router();

// Store file in memory 
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

router.post('/', protect, upload.single('image'), uploadImage);
router.delete('/:publicId', protect, deleteImage);

export default router;
