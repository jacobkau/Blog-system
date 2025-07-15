import express from 'express';
import { getCommentsByPost, createComment } from '../controllers/comments.js';

const router = express.Router();

router.get('/:postId', getCommentsByPost); 
router.post('/:postId', createComment);    

export default router;
