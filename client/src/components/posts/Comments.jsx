import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, TextField, Button, Avatar, Stack, IconButton, Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import commentService from '../../api/comments';
import { socket } from '../../api/socket';
import { useAuthContext } from '../../context';

const Comments = ({ postId, initialComments = [] }) => {
  const { user } = useAuthContext();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const joined = useRef(false);

  // Fetch fresh list on mount (in case parent passed stale data)
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

  // Join socket room + subscribe to events
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
      setComments((prev) => prev.filter((x) => x._id !== id));
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
      // Server will emit to room — we don't need to add locally,
      // but it's safe: onCreated dedupes by _id
      await commentService.addComment(postId, text.trim());
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

  const canDelete = (c) =>
    user &&
    (user.id === c.author?._id?.toString() || user.role === 'admin');

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        Comments ({comments.length})
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {user ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Write a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            inputProps={{ maxLength: 1000 }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 1 }}
            disabled={sending || !text.trim()}
          >
            {sending ? 'Posting…' : 'Post Comment'}
          </Button>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please log in to comment.
        </Typography>
      )}

      {comments.length === 0 ? (
        <Typography color="text.secondary">No comments yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {comments.map((c) => (
            <Box key={c._id} sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{ width: 36, height: 36 }}>
                {c.author?.name?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">
                    {c.author?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.createdAt).toLocaleString()}
                  </Typography>
                  {canDelete(c) && (
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(c._id)}
                      sx={{ ml: 'auto' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {c.text}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Comments;
