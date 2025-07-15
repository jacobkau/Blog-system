import Category from '../models/Category.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  
  // Check if category exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ErrorResponse(`Category '${name}' already exists`, 400);
  }

  const category = await Category.create({
    name,
    description
  });

  res.status(201).json({
    success: true,
    data: category
  });
});