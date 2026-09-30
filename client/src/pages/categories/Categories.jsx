import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArticleIcon from '@mui/icons-material/Article';
import { Link } from 'react-router-dom';
import categoryService from '../../api/categories';
import Spinner from '../../components/ui/Spinner';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
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
      const categoriesData = response.data?.data || response.data || response;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setError(null);
    } catch (err) {
      setError('Failed to load categories');
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
      setCategories(categories.filter((cat) => cat._id !== categoryToDelete._id));
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to delete category',
        severity: 'error',
      });
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

  const isCategoryOwner = (category) => {
    if (!user || !category.owner) return false;
    if (category.owner._id) {
      return category.owner._id === user.id || category.owner._id === user._id;
    }
    if (typeof category.owner === 'string') {
      return category.owner === user.id || category.owner === user._id;
    }
    return false;
  };

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  if (loading) return <Spinner />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          Blog Categories
        </Typography>

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

      {categories.length === 0 ? (
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
            <Grid
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}   
              key={category._id}
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
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Top row */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      fontWeight={600}
                      sx={{ pr: 1 }}
                    >
                      {category.name}
                    </Typography>

                    {(isCategoryOwner(category) || isAdmin) && (
                      <Chip
                        label={isAdmin ? 'Admin' : 'Owner'}
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      minHeight: 40,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {category.description || 'No description available'}
                  </Typography>

                  {/* Post count */}
                  {category.postCount !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ArticleIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        {category.postCount}{' '}
                        {category.postCount === 1 ? 'post' : 'posts'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <Divider />

                <CardActions
                  sx={{
                    px: 2,
                    py: 1.5,
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    component={Link}
                    to={`/category/${category.slug || category._id}`}
                    size="small"
                    color="primary"
                  >
                    View Posts
                  </Button>

                  {(isCategoryOwner(category) || isAdmin) && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/categories/edit/${category._id}`}
                        title="Edit category"
                      >
                        <EditIcon fontSize="small" /> Edit
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(category)}
                        disabled={category.postCount > 0}
                        title={
                          category.postCount > 0
                            ? 'Cannot delete category with posts'
                            : 'Delete category'
                        }
                      >
                        <DeleteIcon fontSize="small" /> Delete
                      </IconButton>
                    </Box>
                  )}
                </CardActions>
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
        <DialogTitle id="delete-dialog-title">Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{categoryToDelete?.name}"?
            {categoryToDelete?.postCount > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This category has {categoryToDelete?.postCount} posts. Deleting
                it may affect these posts.
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

      {/* Snackbar */}
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
