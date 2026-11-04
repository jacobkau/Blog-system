import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, TextField, Button, Avatar, Stack, IconButton, Divider, Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import { toast } from 'react-toastify';
import commentService from '../../api/comments';
import { socket } from '../../api/socket';
import { useAuthContext } from '../../context';

const CommentItem = ({ 
  comment, 
  allComments, 
  user, 
  onDelete, 
  onReply, 
  depth = 0 
}) => {
  // Find direct children of this comment
  const replies = allComments.filter(c => c.parentComment === comment._id);

  const canDelete = user && (user.id === comment.author?._id?.toString() || user.role === 'admin');

  return (
    <Box sx={{ ml: depth > 0 ? 4 : 0, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar sx={{ width: 36, height: 36 }}>
          {comment.author?.name?.[0]?.toUpperCase() || '?'}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2">
              {comment.author?.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(comment.createdAt).toLocaleString()}
            </Typography>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              {depth < 3 && user && (
                <IconButton size="small" onClick={() => onReply(comment._id)}>
                  <ReplyIcon fontSize="small" />
                </IconButton>
              )}
              {canDelete && (
                <IconButton size="small" color="error" onClick={() => onDelete(comment._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
            {comment.text}
          </Typography>
        </Box>
      </Box>

      {/* Render replies recursively */}
      {replies.length > 0 && (
        <Box sx={{ mt: 1 }}>
          {replies.map(reply => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              allComments={allComments} 
              user={user}
              onDelete={onDelete}
              onReply={onReply}
              depth={depth + 1}
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
  const [replyTo, setReplyTo] = useState(null); // ⬅ NEW
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
      // Remove the comment and any of its replies
      setComments((prev) => prev.filter((x) => x._id !== id && x.parentComment !== id));
    };

    socket.on('comment:created', onCreated);
    socket.on('comment:deleted', onDeleted);

    return () => {
      socket.off('comment:created', onCreated);
      socket.off('comment:deleted', onDeleted);
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
      await commentService.addComment(postId, text.trim(), replyTo);
      setText('');
      setReplyTo(null);
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

  const handleReply = (commentId) => {
    setReplyTo(commentId);
    // Scroll to form (optional, just for UX)
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Top level comments (no parent)
  const topLevelComments = comments.filter(c => !c.parentComment);

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        Comments ({comments.length})
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {user ? (
        <Paper id="comment-form" variant="outlined" sx={{ p: 2, mb: 4 }}>
          {replyTo && (
            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Replying to a comment...
              </Typography>
              <Button size="small" onClick={() => setReplyTo(null)}>
                Cancel Reply
              </Button>
            </Box>
          )}
          
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder={replyTo ? "Write a reply…" : "Write a comment…"}
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
            {sending ? 'Posting…' : replyTo ? 'Post Reply' : 'Post Comment'}
          </Button>
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please log in to comment.
        </Typography>
      )}

      {topLevelComments.length === 0 ? (
        <Typography color="text.secondary">No comments yet.</Typography>
      ) : (
        <Stack spacing={3}>
          {topLevelComments.map((c) => (
            <CommentItem 
              key={c._id} 
              comment={c} 
              allComments={comments} 
              user={user}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Comments;
