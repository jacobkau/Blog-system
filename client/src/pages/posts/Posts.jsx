import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import PostList from '../../components/posts/PostList';
import postService from '../../api/posts';
import Spinner from '../../components/ui/Spinner';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

useEffect(() => {
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts({
        page: currentPage,
        limit: postsPerPage,
        sort: '-createdAt'
      });
      
      console.log('Raw API response:', response);
      
      
      if (!response) {
        console.error('Empty response received');
        throw new Error('Server returned empty response');
      }
      

      const postsData = response.data || response.posts || response;
      const paginationData = response.pagination || {
        pages: Math.ceil(response.total / postsPerPage),
        total: response.total,
        page: currentPage
      };
      
      if (!postsData) {
        throw new Error('Posts data not found in response');
      }
      
      setPosts(Array.isArray(postsData) ? postsData : []);
      setTotalPages(paginationData.pages || 1);
      
    } catch (err) {
      console.error('Fetch error details:', {
        error: err,
        response: err.response
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, [currentPage]);

const PostsByCategory = ({ categoryId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    postService.getPostsByCategory(categoryId).then((res) => {
      setPosts(res.data);
    }).catch((err) => {
      console.error('Error loading posts:', err);
    });
  }, [categoryId]);

  return (
    <div>
      {posts.map(post => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
};

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <Spinner />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!posts || posts.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>No posts found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          All Blog Posts
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <PostList posts={posts} />
      </Grid>
      
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "contained" : "outlined"}
              onClick={() => handlePageChange(page)}
              sx={{ mx: 0.5, minWidth: 36 }}
            >
              {page}
            </Button>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Posts;