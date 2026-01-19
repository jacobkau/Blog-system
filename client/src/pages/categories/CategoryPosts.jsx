// components/categories/CategoryPosts.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  IconButton
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import postService from "../../api/posts";
import categoryService from "../../api/categories";
import Spinner from "../../components/ui/Spinner";

const CategoryPosts = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    fetchCategoryPosts();
  }, [slugOrId]);

  const fetchCategoryPosts = async () => {
    try {
      setLoading(true);
      
      // First, try to get the category by ID
      let categoryData;
      try {
        const response = await categoryService.getCategory(slugOrId);
        categoryData = response.data?.data || response.data || response;
        setCategory(categoryData);
      } catch (catError) {
        console.error("Category fetch error:", catError);
        setError("Category not found");
        return;
      }

      // Then fetch posts for this category
      const response = await postService.getPostsByCategory(slugOrId);
      const postsData = response.data?.data || response.data || response;
      setPosts(Array.isArray(postsData) ? postsData : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching category posts:", err);
      setError("Failed to load posts for this category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postService.deletePost(postId);
        // Remove post from state
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete post");
      }
    }
  };

  const isPostOwner = (post) => {
    if (!user || !post.author) return false;
    
    if (post.author._id) {
      return post.author._id === user.id || post.author._id === user._id;
    }
    
    if (typeof post.author === 'string') {
      return post.author === user.id || post.author === user._id;
    }
    
    return false;
  };

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  if (loading) return <Spinner />;

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/categories")}
        >
          Back to Categories
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Button
          color="inherit"
          onClick={() => navigate("/")}
          startIcon={<HomeIcon />}
        >
          Home
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate("/categories")}
          startIcon={<CategoryIcon />}
        >
          Categories
        </Button>
        <Typography color="text.primary">
          {category?.name || "Category"}
        </Typography>
      </Breadcrumbs>

      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/categories")}
        sx={{ mb: 3 }}
      >
        Back to Categories
      </Button>

      {/* Category header */}
      <Box sx={{ mb: 4, p: 3, bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {category?.name}
        </Typography>
        {category?.description && (
          <Typography variant="body1" sx={{ opacity: 0.9 }} paragraph>
            {category.description}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip 
            label={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`} 
            sx={{ backgroundColor: 'white', color: 'primary.main' }}
          />
          {category?.owner && (
            <Typography variant="body2">
              Category by: {category.owner.username || category.owner.email || 'Unknown'}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Create post button for logged in users */}
      {user && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/posts/create?category=${category?._id}`}
          >
            Create Post in this Category
          </Button>
        </Box>
      )}

      {/* Posts grid */}
      {posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No posts found in this category
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Be the first to create a post in this category!
          </Typography>
          {user ? (
            <Button
              variant="contained"
              component={Link}
              to={`/posts/create?category=${category?._id}`}
            >
              Create New Post
            </Button>
          ) : (
            <Button
              variant="contained"
              component={Link}
              to="/login"
            >
              Login to Create Post
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item key={post._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {post.featuredImage && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={post.featuredImage}
                    alt={post.title}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {post.excerpt || post.content?.substring(0, 150) || 'No content available'}...
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      By: {post.author?.username || post.author?.email || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    color="primary"
                    component={Link}
                    to={`/posts/${post._id}`}
                  >
                    Read More
                  </Button>
                  
                  {/* Edit/Delete buttons for post owner or admin */}
                  {(isPostOwner(post) || isAdmin) && (
                    <Box>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/posts/edit/${post._id}`}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CategoryPosts;
