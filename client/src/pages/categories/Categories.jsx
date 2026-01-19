import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Snackbar
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import categoryService from "../../api/categories";
import Spinner from "../../components/ui/Spinner";
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage on component mount
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      // Handle both response formats
      const categoriesData = response.data?.data || response.data || response;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setError(null);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.deleteCategory(categoryToDelete._id);
      
      // Update local state
      setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete category',
        severity: 'error'
      });
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Check if current user is the owner of a category
  const isCategoryOwner = (category) => {
    if (!user || !category.owner) return false;
    
    // If owner is stored as object with _id
    if (category.owner._id) {
      return category.owner._id === user.id || category.owner._id === user._id;
    }
    
    // If owner is stored as string ID
    if (typeof category.owner === 'string') {
      return category.owner === user.id || category.owner === user._id;
    }
    
    return false;
  };

  // Check if user is admin (optional additional permission)
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  if (loading) return <Spinner />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Blog Categories
        </Typography>
        
        {/* Add New Category Button (if user is logged in) */}
        {user && (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/create-category"
          >
            Add New Category
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {categories.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No categories found
          </Typography>
          {user && (
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              component={Link}
              to="/create-category"
            >
              Create Your First Category
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={4}>
          {categories.map((category) => (
            <Grid item key={category._id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ height: "100%", position: 'relative' }}>
                <CardContent>
                  {/* Owner badge */}
                  {(isCategoryOwner(category) || isAdmin) && (
                    <Chip
                      label={isAdmin ? "Admin" : "Owner"}
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: 10, right: 10 }}
                    />
                  )}
                  
                  <Typography gutterBottom variant="h5" component="h2">
                    {category.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {category.description || "No description available"}
                  </Typography>
                  
                  {/* Post count (if available) */}
                  {category.postCount !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
                    </Typography>
                  )}
                  
                  {/* Action buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Button
                      component={Link}
                      to={`/category/${category.slug || category._id}`}
                      size="small"
                      color="primary"
                    >
                      View Posts
                    </Button>
                    
                    {/* Edit/Delete buttons for owner or admin */}
                    {(isCategoryOwner(category) || isAdmin) && (
                      <Box>
                        <IconButton
                          size="small"
                          component={Link}
                          to={`/categories/edit/${category._id}`}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(category)}
                          disabled={category.postCount > 0} // Disable if category has posts
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Category
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{categoryToDelete?.name}"?
            {categoryToDelete?.postCount > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This category has {categoryToDelete?.postCount} posts. 
                Deleting it may affect these posts.
              </Alert>
            )}
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            autoFocus
            disabled={categoryToDelete?.postCount > 0}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Categories;
