import { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import PostList from '../../components/posts/PostList';
import postService from '../../api/posts';
import Spinner from '../../components/ui/Spinner';
import SearchBar from '../../components/ui/SearchBar';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
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
          search: searchQuery || undefined, 
        });

        const postsData = response?.data || response?.posts || response;
        const paginationData = response?.pagination || {
          pages: 1,
          total: 0,
          page: 1,
        };

        if (!Array.isArray(postsData)) {
          throw new Error('Unexpected response shape from /api/posts');
        }

        setPosts(postsData);
        setTotalPages(paginationData.pages || 1);
        setTotalPosts(paginationData.total || postsData.length);
      } catch (err) {
        console.error('Fetch error details:', { error: err, response: err.response });
        setError(err.response?.data?.error || err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, searchQuery]);

  //  Reset to page 1 whenever the search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      <Box sx={{ mb: 3, maxWidth: 480 }}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search posts by title, content..."
        />
      </Box>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          {searchQuery ? (
            <>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No posts match "{searchQuery}"
              </Typography>
              <Button variant="outlined" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </>
          ) : (
            <Typography variant="h6" color="text.secondary">
              No posts found
            </Typography>
          )}
        </Box>
      ) : (
        <>
          {searchQuery && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Found {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} for "{searchQuery}"
            </Typography>
          )}

          <Grid container spacing={4}>
            <PostList posts={posts} />
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                sx={{ mx: 0.5, mb: 1 }}
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current, and one on each side
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => {
                  // Insert ellipsis where there's a gap
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && page - prev > 1;
                  return (
                    <>
                      {showEllipsis && (
                        <Typography key={`gap-${page}`} sx={{ mx: 1, alignSelf: 'center' }}>
                          …
                        </Typography>
                      )}
                      <Button
                        key={page}
                        variant={page === currentPage ? 'contained' : 'outlined'}
                        onClick={() => handlePageChange(page)}
                        sx={{ mx: 0.5, mb: 1, minWidth: 36 }}
                      >
                        {page}
                      </Button>
                    </>
                  );
                })}

              <Button
                variant="outlined"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                sx={{ mx: 0.5, mb: 1 }}
              >
                Next
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Posts;
