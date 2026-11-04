import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import postService from '../api/posts';
import categoryService from '../api/categories';
import { useAuthContext } from '../context';

const StatCard = ({ icon, label, value, color = 'primary.main', to }) => (
  <Card
    sx={{
      height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Avatar sx={{ bgcolor: color, width: 44, height: 44 }}>{icon}</Avatar>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
      {to && (
        <Button
          component={Link}
          to={to}
          size="small"
          sx={{ mt: 1, textTransform: 'none' }}
        >
          View all →
        </Button>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ posts: 0, categories: 0 });
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [postsRes, categoriesRes] = await Promise.all([
          postService.getPosts({ page: 1, limit: 5, sort: '-createdAt' }),
          categoryService.getCategories(),
        ]);

        const postsData = postsRes?.data || postsRes?.posts || postsRes || [];
        const totalPosts = postsRes?.pagination?.total ?? postsData.length ?? 0;

        const catList = Array.isArray(categoriesRes)
          ? categoriesRes
          : categoriesRes?.data || [];

        setStats({
          posts: totalPosts,
          categories: Array.isArray(catList) ? catList.length : 0,
        });
        setRecentPosts(Array.isArray(postsData) ? postsData : []);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.name || user?.username || 'Admin'}
          </Typography>
        </Box>
        <Chip
          label={user?.role === 'admin' ? 'Administrator' : user?.role || 'User'}
          color={user?.role === 'admin' ? 'error' : 'primary'}
        />
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      {/* Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            icon={<ArticleIcon />}
            label="Total Posts"
            value={stats.posts}
            color="primary.main"
            to="/posts"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            icon={<CategoryIcon />}
            label="Categories"
            value={stats.categories}
            color="secondary.main"
            to="/categories"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            icon={<PersonIcon />}
            label="Signed in as"
            value={user?.name || user?.username || '—'}
            color="success.main"
            to="/profile"
          />
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/create-post"
            sx={{ textTransform: 'none' }}
          >
            New Post
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            component={Link}
            to="/create-category"
            sx={{ textTransform: 'none' }}
          >
            New Category
          </Button>
        </Box>
      </Box>

      {/* Recent posts */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          Recent Posts
        </Typography>
        <Card variant="outlined">
          {recentPosts.length === 0 ? (
            <CardContent>
              <Typography color="text.secondary">No posts yet.</Typography>
            </CardContent>
          ) : (
            <List>
              {recentPosts.map((post, idx) => (
                <Box key={post._id}>
                  {idx > 0 && <Divider component="li" />}
                  <ListItem
                    component={Link}
                    to={`/posts/${post._id}`}
                    sx={{
                      color: 'inherit',
                      textDecoration: 'none',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={
                          post.featuredImage && post.featuredImage !== 'no-photo.jpg'
                            ? post.featuredImage
                            : undefined
                        }
                      >
                        <ArticleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={post.title}
                      secondary={`By ${post.author?.name || 'Unknown'} • ${new Date(
                        post.createdAt
                      ).toLocaleDateString()}`}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
          )}
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard;
