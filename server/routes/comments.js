import express from 'express';
import {
  getComments, addComment, deleteComment,
  likeComment, editComment 
} from '../controllers/comments.js';
import { protect } from '../middleware/Auth.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getComments)
  .post(protect, addComment);

router
  .route('/:commentId')
  .delete(protect, deleteComment)
  .put(protect, editComment); 

router.put('/:commentId/like', protect, likeComment); 

export default router;
