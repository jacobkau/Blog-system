import express from 'express';
import {
  getComments,
  addComment,
  deleteComment,
} from '../controllers/comments.js';
import { protect } from '../middleware/Auth.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getComments)
  .post(protect, addComment);

router.delete('/:commentId', protect, deleteComment);

export default router;
