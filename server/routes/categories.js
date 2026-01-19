import express from 'express';
import {
  getCategories,
  createCategory
} from '../controllers/categories.js';

const router = express.Router();


router.route('/')
  .get(getCategories)     
  .post(createCategory);    

export default router;
