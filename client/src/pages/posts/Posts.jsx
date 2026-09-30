import { useState, useEffect, useMemo } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import PostList from '../../components/posts/PostList';
import postService from '../../api/posts';
import Spinner from '../../components/ui/Spinner';
import SearchBar from '../../components/ui/SearchBar';

// Strip HTML for search matching
const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await postService.getPosts({
          page: currentPage,
          limit: postsPerPage,
          sort: '-createdAt',
          search: searchQuery, 
        });

        const postsData = response?.data || response?.posts || response;
        const paginationData = response?.pagination || {
          pages: Math.ceil((response?.total || 0) / postsPerPage),
          total: response?.total,
          page: currentPage,
        };

        if (!Array.isArray(postsData)) {
          throw new Error('Unexpected response shape from /api/posts');
        }

        setPosts(postsData);
        setTotalPages(paginationData.pages || 1);
      } catch (err) {
        console.error('Fetch error details:', { error: err, response: err.response });
        setError(err.response?.data?.error || err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  // Filter posts by title + excerpt + content + author + categories
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;

    return posts.filter((post) => {
      const title = (post.title || '').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const content = stripHtml(post.content || '').toLowerCase();
      const author = (post.author?.name || '').toLowerCase();
      const cats = Array.isArray(post.categories)
        ? post.categories.map((c) => (c.name || '').toLowerCase()).join(' ')
        : '';

      return (
        title.includes(q) ||
        excerpt.includes(q) ||
        content.includes(q) ||
        author.includes(q) ||
        cats.includes(q)
      );
    });
  }, [posts, searchQuery]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <Spinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          All Blog Posts
        </Typography>
      </Box>

      {/*  Search bar */}
      <Box sx={{ mb: 3, maxWidth: 480 }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search posts by title, content, author, or category..."
        />
      </Box>

      {posts.length === 0 ? (
        <Typography>No posts found</Typography>
      ) : filteredPosts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No posts match "{searchQuery}"
          </Typography>
          <Button variant="outlined" onClick={() => setSearchQuery('')}>
            Clear search
          </Button>
        </Box>
      ) : (
        <>
          {searchQuery && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Showing {filteredPosts.length} of {posts.length} posts on this page
            </Typography>
          )}

          <Grid container spacing={4}>
            <PostList posts={filteredPosts} />
          </Grid>
        </>
      )}

      {/* Pagination — hidden while searching */}
      {!searchQuery && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'contained' : 'outlined'}
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
