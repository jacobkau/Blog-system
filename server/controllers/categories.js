import Category from '../models/Category.js';
import Post from '../models/Post.js'; // Add this import
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate('owner', 'username email name') // Populate owner info
    .sort({ createdAt: -1 });
    
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('owner', 'username email name');
    
  if (!category) {
    throw new ErrorResponse(`Category not found with id of ${req.params.id}`, 404);
  }
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = asyncHandler(async (req, res) => {
  // Add user to req.body for owner field
  req.body.owner = req.user.id;
  
  const { name, description } = req.body;
  
  // Check if category exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new ErrorResponse(`Category '${name}' already exists`, 400);
  }

  // Create slug from name
  req.body.slug = name.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new ErrorResponse(`Category not found with id of ${req.params.id}`, 404);
  }
  
  // Make sure user is category owner or admin
  if (category.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorResponse(`User ${req.user.id} is not authorized to update this category`, 401);
  }
  
  // If name is being updated, check for duplicates
  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      throw new ErrorResponse(`Category '${req.body.name}' already exists`, 400);
    }
    
    // Update slug if name changed
    req.body.slug = req.body.name.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  }
  
  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw new ErrorResponse(`Category not found with id of ${req.params.id}`, 404);
  }
  
  // Make sure user is category owner or admin
  if (category.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorResponse(`User ${req.user.id} is not authorized to delete this category`, 401);
  }
  
  // Check if category has posts
  const postCount = await Post.countDocuments({ category: category._id });
  if (postCount > 0) {
    throw new ErrorResponse(`Cannot delete category with ${postCount} existing posts`, 400);
  }
  
  await category.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});
