import mongoose from 'mongoose';                         // ✅ added
import Post from '../models/Post.js';
import Category from '../models/Category.js';            // ✅ added
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const [posts, total] = await Promise.all([
    Post.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(req.query.sort || '-createdAt')
      .populate('author', 'name email')
      .populate('categories', 'name'),
    Post.countDocuments(),
  ]);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: posts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
    },
  });
});

// @desc    Get posts by category
// @route   GET /api/posts/category/:categoryId
// @access  Public
export const getPostsByCategory = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.categoryId;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return next(new ErrorResponse('Invalid category ID', 400));
  }

  // Verify the category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${categoryId}`, 404)
    );
  }

  // Find all posts that include this category
  const posts = await Post.find({ categories: categoryId })
    .populate('categories', 'name')
    .populate('author', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    count: posts.length,
    category: {
      _id: category._id,
      name: category.name,
    },
    posts,
  });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('categories')
    .populate('author', '_id name email');

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: post });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res, next) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return next(new ErrorResponse('Title and content are required', 400));
  }

  if (!req.user?._id) {
    return next(new ErrorResponse('User authentication failed', 401));
  }

  const post = await Post.create({
    title,
    content,
    excerpt: content.substring(0, 100) + '...',
    author: req.user._id,
    categories: req.body.categories || [],
    featuredImage: req.body.featuredImage || 'no-photo.jpg',
  });

  const populatedPost = await Post.findById(post._id)
    .populate('author', 'name email')
    .populate('categories', 'name');

  res.status(201).json({
    success: true,
    data: populatedPost,
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this post`,
        401
      )
    );
  }

  Object.assign(post, req.body);
  await post.save();

  res.status(200).json({ success: true, data: post });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this post`,
        401
      )
    );
  }

  await post.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
