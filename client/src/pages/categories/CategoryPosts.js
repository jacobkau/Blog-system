// components/categories/CategoryPosts.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Chip
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import postService from "../../api/posts";
import categoryService from "../../api/categories";
import Spinner from "../../components/ui/Spinner";
import PostList from "../../components/posts/PostList";

const CategoryPosts = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryPosts();
  }, [slugOrId]);

  const fetchCategoryPosts = async () => {
    try {
      setLoading(true);
      
      // First, try to get the category by slug or ID
      let categoryData;
      try {
        categoryData = await categoryService.getCategory(slugOrId);
        setCategory(categoryData.data || categoryData);
      } catch (catError) {
        // If category not found, show error
        setError("Category not found");
        return;
      }

      // Then fetch posts for this category
      const response = await postService.getPostsByCategory(slugOrId);
      setPosts(response.data || response.data?.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching category posts:", err);
      setError("Failed to load posts for this category");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/categories")}>
          Back to Categories
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumb navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <MuiLink
          component={Button}
          color="inherit"
          onClick={() => navigate("/")}
          startIcon={<HomeIcon />}
        >
          Home
        </MuiLink>
        <MuiLink
          component={Button}
          color="inherit"
          onClick={() => navigate("/categories")}
          startIcon={<CategoryIcon />}
        >
          Categories
        </MuiLink>
        <Typography color="text.primary">
          {category?.name || "Category"}
        </Typography>
      </Breadcrumbs>

      {/* Category header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {category?.name}
        </Typography>
        {category?.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {category.description}
          </Typography>
        )}
        <Chip 
          label={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`} 
          color="primary" 
          variant="outlined"
          sx={{ mr: 1 }}
        />
        {category?.owner && (
          <Chip
            label={`By: ${category.owner.username || category.owner.email}`}
            variant="outlined"
          />
        )}
      </Box>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No posts found in this category
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Be the first to create a post in this category!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/posts/create")}
          >
            Create New Post
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <PostList posts={posts} />
        </Grid>
      )}
    </Container>
  );
};

export default CategoryPosts;
