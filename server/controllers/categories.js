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

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await Post.countDocuments({ categories: cat._id });
      return {
        ...cat.toObject(),
        postCount: count,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCounts.length,
    data: categoriesWithCounts,
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

  const postCount = await Post.countDocuments({ categories: category._id });

  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      postCount,
    },
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    return next(new ErrorResponse('Please provide a category name', 400));
  }

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return next(new ErrorResponse(`Category '${name}' already exists`, 400));
  }

  if (!req.user || !req.user._id) {
    return next(new ErrorResponse('Not authorized to create a category', 401));
  }

  const category = await Category.create({
    name,
    description,
    owner: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  const isOwner =
    category.owner && category.owner.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(
      new ErrorResponse('Not authorized to update this category', 403)
    );
  }


  const { name, description } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;

  category = await Category.findByIdAndUpdate(req.params.id, updates, {
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
// @access  Private
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  const isOwner =
    category.owner && category.owner.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(
      new ErrorResponse('Not authorized to delete this category', 403)
    );
  }

 
  const postCount = await Post.countDocuments({ categories: category._id });
  if (postCount > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete category with ${postCount} existing post(s)`,
        400
      )
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
