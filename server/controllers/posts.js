import Post from '../models/Post.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// Example proper controller
export const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const [posts, total] = await Promise.all([
    Post.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(req.query.sort || '-createdAt')
      .populate('author', 'name email'),
    Post.countDocuments()
  ]);

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: posts, 
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page
    }
  });
});

export const getPostsByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  console.log('Category ID:', categoryId);

  // Validate if it's a valid Mongo ObjectId
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({ message: 'Invalid category ID' });
  }

  // Get all posts that include this category
  const posts = await Post.find({ categories: categoryId }) // uses $in internally
    .populate('categories', 'name')
    .populate('author', 'name email');

  // Get the category name
  const category = await Category.findById(categoryId);

  res.status(200).json({
    status: 'success',
    posts,
    category: category ? category.name : 'Unknown',
  });
});




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

export const createPost = asyncHandler(async (req, res, next) => {
    // Debugging: Log the incoming request user
    console.log('Authenticated User:', req.user);
    
    // Validate required fields
    const { title, content } = req.body;
    if (!title || !content) {
        return next(new ErrorResponse('Title and content are required', 400));
    }

    // Verify user exists and is authenticated
    if (!req.user?._id) {
        console.error('No authenticated user found');
        return next(new ErrorResponse('User authentication failed', 401));
    }

    // Create post with populated author data
    const post = await Post.create({
        title,
        content,
        excerpt: content.substring(0, 100) + '...', // Auto-generate excerpt
        author: req.user._id,
        categories: req.body.categories || [],
        featuredImage: req.body.featuredImage || 'no-photo.jpg'
    });

    // Populate author details in the response
    const populatedPost = await Post.findById(post._id)
        .populate('author', 'name email')
        .populate('categories', 'name');

    res.status(201).json({
        success: true,
        data: populatedPost
    });
});


// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res, next) => {
  console.log('Update request by:', req.user);
  console.log('Update data:', req.body);

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this post`, 401));
  }

  Object.assign(post, req.body);

  await post.save();

  res.status(200).json({ success: true, data: post });
});

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
