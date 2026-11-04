import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Avatar, Paper, Divider, Grid, CircularProgress, Button
} from '@mui/material';
import { Email, LocationOn, Language, CalendarToday, ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import postService from '../../api/posts';
import PostList from '../../components/posts/PostList';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Fetch User Details
        const userRes = await axios.get(`https://blog-system-q65l.onrender.com/api/auth/user/${id}`);
        setUser(userRes.data.data);

        // 2. Fetch User's Posts
        const postsRes = await postService.getPosts({ author: id, limit: 10 });
        setPosts(postsRes.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" sx={{ mt: 5 }}>{error}</Typography>;
  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar
            src={user.avatar || undefined}
            sx={{ width: 120, height: 120, fontSize: 48, bgcolor: 'primary.main' }}
          >
            {user.name?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 250 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {user.bio || 'This user has not written a bio yet.'}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <Email fontSize="small" /> <Typography variant="body2">{user.email}</Typography>
                </Box>
              </Grid>
              {user.location && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <LocationOn fontSize="small" /> <Typography variant="body2">{user.location}</Typography>
                  </Box>
                </Grid>
              )}
              {user.website && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <Language fontSize="small" />
                    <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                      {user.website}
                    </a>
                  </Box>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <CalendarToday fontSize="small" /> <Typography variant="body2">Joined {new Date(user.createdAt).toLocaleDateString()}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ mb: 4 }} />
      
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Posts by {user.name}
      </Typography>
      
      {posts.length === 0 ? (
        <Typography color="text.secondary">No posts published yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          <PostList posts={posts} />
        </Grid>
      )}
    </Container>
  );
};

export default UserProfile;
