import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getComments = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).select('_id');
  if (!post) return next(new ErrorResponse('Post not found', 404));

  const comments = await Comment.find({ post: postId })
    .populate('author', 'name email avatar') 
    .sort('createdAt');

  res.status(200).json({ success: true, count: comments.length, data: comments });
});

// @desc    Add a comment or a reply
// @route   POST /api/posts/:postId/comments
// @access  Private
export const addComment = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;
  const { text, parentComment } = req.body; 

  if (!text || !text.trim()) {
    return next(new ErrorResponse('Comment text is required', 400));
  }

  const post = await Post.findById(postId);
  if (!post) return next(new ErrorResponse('Post not found', 404));

  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) {
      return next(new ErrorResponse('Parent comment not found', 404));
    }
  }

  let comment = await Comment.create({
    text: text.trim(),
    post: postId,
    author: req.user._id,
    parentComment: parentComment || null, 
  });

  post.comments.push(comment._id);
  await post.save();

  comment = await comment.populate('author', 'name email avatar'); 
  
  const io = req.app.get('io');
  io.to(`post:${postId}`).emit('comment:created', comment);

  res.status(201).json({ success: true, data: comment });
});

// @desc    Delete a comment (and all its nested replies)
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private (author of comment, post author, or admin)
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) return next(new ErrorResponse('Comment not found', 404));

  const isCommentAuthor = comment.author.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  const isPostAuthor = await Post.findById(postId).then(
    (p) => p && p.author.toString() === req.user.id
  );

  if (!isCommentAuthor && !isAdmin && !isPostAuthor) {
    return next(new ErrorResponse('Not authorized to delete this comment', 401));
  }

  const getDescendantIds = async (parentId) => {
    const children = await Comment.find({ parentComment: parentId }).distinct('_id');
    let ids = [...children];
    for (const childId of children) {
      const grandChildren = await getDescendantIds(childId);
      ids = ids.concat(grandChildren);
    }
    return ids;
  };

  const descendantIds = await getDescendantIds(commentId);
  const allIds = [commentId, ...descendantIds];
  await Comment.deleteMany({ _id: { $in: allIds } });

  await Post.findByIdAndUpdate(postId, {
    $pull: { comments: { $in: allIds } },
  });
  
  const io = req.app.get('io');
  io.to(`post:${postId}`).emit('comment:deleted', commentId);

  res.status(200).json({ success: true, data: {} });
});

// @desc    Like/Unlike a comment
// @route   PUT /api/posts/:postId/comments/:commentId/like
// @access  Private
export const likeComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;

  let comment = await Comment.findById(commentId);
  if (!comment) return next(new ErrorResponse('Comment not found', 404));

  const isLiked = comment.likes.includes(req.user.id);

  if (isLiked) {
    comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
  } else {
    comment.likes.push(req.user.id);
  }

  await comment.save();

  // ⬇ FIX: We must populate the author BEFORE emitting the socket event
  comment = await comment.populate('author', 'name email avatar');

  const io = req.app.get('io');
  io.to(`post:${postId}`).emit('comment:updated', comment);

  res.status(200).json({ success: true, likes: comment.likes });
});

// @desc    Edit a comment
// @route   PUT /api/posts/:postId/comments/:commentId
// @access  Private (Author only)
export const editComment = asyncHandler(async (req, res, next) => {
  const { postId, commentId } = req.params;

  let comment = await Comment.findById(commentId);
  if (!comment) return next(new ErrorResponse('Comment not found', 404));

  if (comment.author.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to edit this comment', 401));
  }

  comment.text = req.body.text;
  await comment.save();
  
  // ⬇ FIX: We must populate the author BEFORE emitting the socket event
  comment = await comment.populate('author', 'name email avatar'); 

  const io = req.app.get('io');
  io.to(`post:${postId}`).emit('comment:updated', comment);

  res.status(200).json({ success: true, data: comment });
});
