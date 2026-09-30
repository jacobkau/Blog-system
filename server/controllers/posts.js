import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const escapeRegex = (str = '') =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildPostQuery = (req) => {
  const query = {};
  const { search, author, category } = req.query;

  // Full-text-ish search across multiple fields
  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [
      { title: regex },
      { excerpt: regex },
      { content: regex },
    ];
  }

  // Filter by author id
  if (author && mongoose.Types.ObjectId.isValid(author)) {
    query.author = author;
  }

  // Filter by category id
  if (category && mongoose.Types.ObjectId.isValid(category)) {
    query.categories = category;
  }

  return query;
};

// @desc    Get all posts (with optional search + filters)
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = buildPostQuery(req);

  const [posts, total] = await Promise.all([
    Post.find(query)
      .skip(skip)
      .limit(limit)
      .sort(req.query.sort || '-createdAt')
      .populate('author', 'name email')
      .populate('categories', 'name'),
    Post.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: posts,
    pagination: {
      total,
      pages: Math.ceil(total / limit) || 1,
      page,
    },
  });
});

// @desc    Get posts by category (with optional search)
// @route   GET /api/posts/category/:categoryId
// @access  Public
export const getPostsByCategory = asyncHandler(async (req, res, next) => {
  const categoryId = req.params.categoryId;

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return next(new ErrorResponse('Invalid category ID', 400));
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${categoryId}`, 404)
    );
  }

  const query = { categories: categoryId };

  // Optional search inside category
  if (req.query.search && req.query.search.trim()) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    query.$or = [{ title: regex }, { excerpt: regex }, { content: regex }];
  }

  const posts = await Post.find(query)
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
  const { title, content, excerpt } = req.body;

  if (!title || !content) {
    return next(new ErrorResponse('Title and content are required', 400));
  }

  if (!req.user?._id) {
    return next(new ErrorResponse('User authentication failed', 401));
  }

  const plainText = stripHtml(content);
  const finalExcerpt =
    (excerpt && stripHtml(excerpt).substring(0, 200)) ||
    (plainText.length > 160
      ? plainText.substring(0, 160) + '...'
      : plainText);

  const post = await Post.create({
    title,
    content,
    excerpt: finalExcerpt,
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

  const { title, content, excerpt, categories, featuredImage } = req.body;

  if (title !== undefined) post.title = title;
  if (categories !== undefined) post.categories = categories;
  if (featuredImage !== undefined) post.featuredImage = featuredImage;

  if (content !== undefined) {
    post.content = content;
    const plainText = stripHtml(content);
    post.excerpt =
      (excerpt && stripHtml(excerpt).substring(0, 200)) ||
      (plainText.length > 160
        ? plainText.substring(0, 160) + '...'
        : plainText);
  } else if (excerpt !== undefined) {
    post.excerpt = stripHtml(excerpt).substring(0, 200);
  }

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
