import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.js';
import { protect, authorize } from '../middleware/Auth.js';

const router = express.Router();

router
  .route('/')
  .get(getCategories)
  .post(protect, createCategory); 

router
  .route('/:id')
  .get(getCategory)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;
