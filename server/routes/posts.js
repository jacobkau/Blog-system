import express from 'express';
import { getPosts, getPostsByCategory, createPost, getPost, updatePost, deletePost } from '../controllers/posts.js';
import { protect } from '../middleware/Auth.js';
import advancedResults from '../middleware/advancedResults.js';
import Post from '../models/Post.js';

const router = express.Router();

router
  .route('/')
  .get(advancedResults(Post, ['categories', 'author']), getPosts)
  .post(protect, createPost);

router
  .route('/:id')
  .get(getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);
router.get('/category/:categoryId', getPostsByCategory);
export default router;
