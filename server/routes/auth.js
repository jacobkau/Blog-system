import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  forgotPassword,   
  resetPassword,    
  updatePassword,
} from '../controllers/auth.js';
import { protect } from '../middleware/Auth.js';
import multer from 'multer';
import { uploadAvatar } from '../controllers/avatar.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

router.post('/register', register);
router.post('/login', login);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/updatedetails', protect, updateDetails);
router.post('/updatepassword', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;
