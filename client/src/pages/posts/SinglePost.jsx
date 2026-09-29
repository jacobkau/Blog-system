import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Chip, Divider } from '@mui/material';
import DOMPurify from 'dompurify';
import postService from '../../api/posts';
import Spinner from '../../components/ui/Spinner';
import { useAuthContext } from '../../context';

const SinglePost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      setError('Invalid post ID');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postService.getPost(id);
        setPost(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Failed to load post'
        );
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(post._id);
      navigate('/posts');
    } catch (err) {
      console.error('Failed to delete:', err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Error deleting post'
      );
    }
  };

  const isAuthor = user?.id?.toString() === post?.author?._id?.toString();

  if (loading) return <Spinner />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!post) return <Typography>Post not found</Typography>;

  // Sanitize HTML before rendering
  const safeHTML = DOMPurify.sanitize(post.content || '', {
    ADD_ATTR: ['target', 'rel'],
  });

  const hasFeatured =
    post.featuredImage && post.featuredImage !== 'no-photo.jpg';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <article>
        {/* Title */}
        <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
          {post.title}
        </Typography>

        {/* Meta row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            By {post.author?.name || 'Unknown author'}
          </Typography>
        </Box>

        {/* Categories */}
        {Array.isArray(post.categories) && post.categories.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {post.categories.map((cat) => (
              <Chip
                key={cat._id || cat}
                label={cat.name || cat}
                size="small"
                component={Link}
                to={`/category/${cat._id || cat}`}
                clickable
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Featured image */}
        {hasFeatured && (
          <Box
            component="img"
            src={post.featuredImage}
            alt={post.title}
            sx={{
              width: '100%',
              maxHeight: 500,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 4,
            }}
          />
        )}

        <Divider sx={{ mb: 3 }} />

        {/* ✅ Rich content */}
        <Box
          sx={{
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: 'text.primary',
            '& h1, & h2, & h3': {
              mt: 3,
              mb: 1.5,
              fontWeight: 600,
              lineHeight: 1.3,
            },
            '& h2': { fontSize: '1.5rem' },
            '& h3': { fontSize: '1.25rem' },
            '& p': { my: 1.5 },
            '& ul, & ol': { pl: 3, my: 1.5 },
            '& li': { mb: 0.5 },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 2,
              my: 2,
              fontStyle: 'italic',
              color: 'text.secondary',
            },
            '& pre': {
              bgcolor: 'action.hover',
              p: 2,
              borderRadius: 1,
              overflowX: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            },
            '& code': {
              bgcolor: 'action.hover',
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.9em',
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 2,
              my: 3,
              display: 'block',
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
          dangerouslySetInnerHTML={{ __html: safeHTML }}
        />

        {/* Author actions */}
        {isAuthor && (
          <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              component={Link}
              to={`/edit-post/${post._id}`}
            >
              Edit Post
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete}>
              Delete Post
            </Button>
          </Box>
        )}
      </article>
    </Container>
  );
};

export default SinglePost;
