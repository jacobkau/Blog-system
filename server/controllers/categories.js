import Category from '../models/Category.js';
import Post from '../models/Post.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().populate({
    path: 'owner',
    select: 'name email',
  });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate({
    path: 'owner',
    select: 'name email',
  });

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  // Basic input validation
  if (!name) {
    return next(new ErrorResponse('Please provide a category name', 400));
  }

  // Check if category already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(
      new ErrorResponse(`Category '${name}' already exists`, 400)
    );
  }

  // Ensure req.user exists (should be set by your auth middleware)
  if (!req.user || !req.user.id) {
    return next(new ErrorResponse('Not authorized to create a category', 401));
  }

  const category = await Category.create({
    name,
    description,
    owner: req.user.id, // <-- THE FIX: assign owner from authenticated user
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  // Only owner or admin can update
  if (
    category.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to update this category', 403)
    );
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is owner or admin
  if (
    category.owner.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse('Not authorized to delete this category', 403)
    );
  }

  // Check if category has posts
  const postCount = await Post.countDocuments({ category: category._id });
  if (postCount > 0) {
    return next(
      new ErrorResponse(
        'Cannot delete category with existing posts',
        400
      )
    );
  }

  // Modern Mongoose: use deleteOne() instead of remove()
  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
