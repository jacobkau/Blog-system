import Comment from '../models/comment.js';

export const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).populate('user', 'name');
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    console.log('Incoming comment request:', {
      body: req.body,
      user: req.user,
      params: req.params
    });

    if (!req.body.text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = new Comment({
      text: req.body.text,
      user: req.user._id,
      post: req.params.postId
    });

    const savedComment = await comment.save();
    const populated = await savedComment.populate('user', 'name');
    
    res.status(201).json(populated);
  } catch (err) {
    console.error('Comment creation error:', err);
    res.status(400).json({ 
      message: 'Error creating comment',
      error: err.message 
    });
  }
};
