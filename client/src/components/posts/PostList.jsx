import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';

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

const PostList = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return <Typography>No posts to display</Typography>;
  }

  return (
    <>
      {posts.map((post) => {

        const rawPreview =
          post.excerpt?.trim() || stripHtml(post.content) || 'No content available';
        const preview = stripHtml(rawPreview).substring(0, 160);

        const hasImage =
          post.featuredImage && post.featuredImage !== 'no-photo.jpg';

        return (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}  
            key={post._id}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              {hasImage && (
                <CardMedia
                  component="img"
                  height="200"
                  image={post.featuredImage}
                  alt={post.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {post.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {preview.length >= 160 ? `${preview}...` : preview}
                </Typography>

                {Array.isArray(post.categories) && post.categories.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {post.categories.slice(0, 3).map((cat) => (
                      <Chip
                        key={cat._id || cat}
                        label={cat.name || cat}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    By {post.author?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  component={Link}
                  to={`/posts/${post._id}`}
                  size="small"
                  variant="contained"
                  fullWidth
                >
                  Read More
                </Button>
              </Box>
            </Card>
          </Grid>
        );
      })}
    </>
  );
};

export default PostList;
