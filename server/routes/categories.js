import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categories.js';
import { protect } from '../middleware/auth.js'; // Import protect middleware

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, createCategory); // Protected route

router.route('/:id')
  .get(getCategory)
  .put(protect, updateCategory)    // Protected route
  .delete(protect, deleteCategory); // Protected route

export default router;
