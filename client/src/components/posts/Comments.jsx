import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, TextField, Button, Avatar, Stack, IconButton, Divider, Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import { Favorite, FavoriteBorder } from '@mui/icons-material'; 
import { toast } from 'react-toastify';
import commentService from '../../api/comments';
import { socket } from '../../api/socket';
import { useAuthContext } from '../../context';

const CommentItem = ({ 
  comment, 
  allComments, 
  user, 
  onDelete, 
  depth = 0,
  postId
}) => {
  const replies = allComments.filter(c => c.parentComment === comment._id);
  
  // Check permissions
  const isAuthor = user?.id === comment.author?._id?.toString();
  const canDelete = user && (isAuthor || user.role === 'admin');
  const canEdit = user && isAuthor;
  
  // Local state for forms
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.text);
  const [sending, setSending] = useState(false);
  
  // Local state for likes
  const [likes, setLikes] = useState(comment.likes || []);
  
  // ⬇ FIX: Convert all likes to strings before checking
  const stringLikes = likes.map(id => id.toString());
  const isLiked = user && stringLikes.includes(user.id);

  const isNested = depth > 0;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;
    
    setSending(true);
    try {
      await commentService.addComment(postId, replyText.trim(), comment._id);
      setReplyText('');
      setIsReplying(false); 
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post reply');
    } finally {
      setSending(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim() || sending) return;

    setSending(true);
    try {
      await commentService.editComment(postId, comment._id, editText.trim());
      setIsEditing(false);
      comment.text = editText; 
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to edit comment');
    } finally {
      setSending(false);
    }
  };

  const handleLike = async () => {
    if (!user) return toast.error('Log in to like comments');
    try {
      const res = await commentService.likeComment(postId, comment._id);
      setLikes(res.likes);
    } catch (err) {
      toast.error('Failed to like comment');
    }
  };

  return (
    <Box sx={{ mt: 2, ml: isNested ? 4 : 0 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2,
          bgcolor: isNested ? 'action.hover' : 'transparent',
          p: isNested ? 2 : 0,
          borderRadius: 2,
          borderLeft: isNested ? '3px solid' : 'none',
          borderColor: 'primary.light',
        }}
      >
        {/* CLICKABLE AVATAR */}
        <Avatar 
          component={Link}
          to={`/profile/${comment.author?._id}`}
          src={comment.author?.avatar} 
          sx={{ 
            width: 36, 
            height: 36, 
            bgcolor: isNested ? 'secondary.main' : 'primary.main',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          {comment.author?.name?.[0]?.toUpperCase() || '?'}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* CLICKABLE NAME */}
            <Typography 
              component={Link}
              to={`/profile/${comment.author?._id}`}
              variant="subtitle2" 
              fontWeight={600}
              sx={{ 
                color: 'text.primary', 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              {comment.author?.name || 'Unknown'}
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              {new Date(comment.createdAt).toLocaleString()}
            </Typography>
            
            {/* ACTION BUTTONS */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              {/* Like Button */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="small" onClick={handleLike} color={isLiked ? 'error' : 'default'}>
                  {isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                </IconButton>
                {likes.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {likes.length}
                  </Typography>
                )}
              </Box>

              {/* Reply Button */}
              {depth < 3 && user && (
                <IconButton 
                  size="small" 
                  onClick={() => setIsReplying(!isReplying)}
                  color={isReplying ? "primary" : "default"}
                >
                  <ReplyIcon fontSize="small" />
                </IconButton>
              )}
              
              {/* Edit Button */}
              {canEdit && !isEditing && (
                <IconButton size="small" onClick={() => setIsEditing(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}

              {/* Delete Button */}
              {canDelete && (
                <IconButton size="small" color="error" onClick={() => onDelete(comment._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          
          {/* EDIT MODE */}
          {isEditing ? (
            <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button type="submit" variant="contained" size="small" disabled={sending}>
                  Save
                </Button>
                <Button size="small" onClick={() => { setIsEditing(false); setEditText(comment.text); }}>
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            /* VIEW MODE */
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5, color: 'text.primary' }}>
              {comment.text}
            </Typography>
          )}

          {/* INLINE REPLY FORM */}
          {isReplying && (
            <Box component="form" onSubmit={handleReplySubmit} sx={{ mt: 2, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                placeholder={`Reply to ${comment.author?.name || 'this comment'}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                inputProps={{ maxLength: 1000 }}
                autoFocus
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="small" 
                  disabled={sending || !replyText.trim()}
                >
                  {sending ? 'Posting…' : 'Reply'}
                </Button>
                <Button 
                  size="small" 
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* RENDER NESTED REPLIES */}
      {replies.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {replies.map(reply => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              allComments={allComments} 
              user={user}
              onDelete={onDelete}
              depth={depth + 1}
              postId={postId}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const Comments = ({ postId, initialComments = [] }) => {
  const { user } = useAuthContext();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const joined = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await commentService.getComments(postId);
        if (!cancelled) setComments(res.data);
      } catch (err) {
        console.error('Failed to load comments', err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [postId]);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit('joinPost', postId);
    joined.current = true;

    const onCreated = (c) => {
      setComments((prev) =>
        prev.some((x) => x._id === c._id) ? prev : [...prev, c]
      );
    };
    const onDeleted = (id) => {
      setComments((prev) => prev.filter((x) => x._id !== id && x.parentComment !== id));
    };
    const onUpdated = (updatedComment) => {
      setComments((prev) => 
        prev.map((c) => c._id === updatedComment._id ? updatedComment : c)
      );
    };

    socket.on('comment:created', onCreated);
    socket.on('comment:deleted', onDeleted);
    socket.on('comment:updated', onUpdated);

    return () => {
      socket.off('comment:created', onCreated);
      socket.off('comment:deleted', onDeleted);
      socket.off('comment:updated', onUpdated);
      if (joined.current) {
        socket.emit('leavePost', postId);
        joined.current = false;
      }
    };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await commentService.addComment(postId, text.trim(), null); 
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.deleteComment(postId, id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete comment');
    }
  };

  const topLevelComments = comments.filter(c => !c.parentComment);

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom fontWeight={700}>
        Comments ({comments.length})
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {user ? (
        <Paper id="comment-form" variant="outlined" sx={{ p: 2, mb: 4, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            Leave a comment
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Share your thoughts…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            inputProps={{ maxLength: 1000 }}
          />
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            disabled={sending || !text.trim()}
            onClick={handleSubmit}
          >
            {sending ? 'Posting…' : 'Post Comment'}
          </Button>
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please log in to comment.
        </Typography>
      )}

      {topLevelComments.length === 0 ? (
        <Typography color="text.secondary">No comments yet. Be the first to share your thoughts!</Typography>
      ) : (
        <Stack spacing={2}>
          {topLevelComments.map((c) => (
            <CommentItem 
              key={c._id} 
              comment={c} 
              allComments={comments} 
              user={user}
              onDelete={handleDelete}
              postId={postId}
              depth={0}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Comments;
