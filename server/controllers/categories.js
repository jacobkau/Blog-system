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
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if user is owner or admin
    if (category.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }
    
    // Check if category has posts
    const postCount = await Post.countDocuments({ category: category._id });
    if (postCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing posts' 
      });
    }
    
    await category.remove();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
