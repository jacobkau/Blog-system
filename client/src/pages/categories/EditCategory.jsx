import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
} from '@mui/material';
import categoryService from '../../api/categories';
import { useAuthContext } from '../../context';
import Spinner from '../../components/ui/Spinner';

const schema = yup.object().shape({
  name: yup.string().required('Category name is required'),
  description: yup.string().max(500, 'Description must be under 500 characters'),
});

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      setError('Invalid category ID');
      setLoading(false);
      return;
    }

    const fetchCategory = async () => {
      try {
        const response = await categoryService.getCategory(id);
        const cat = response?.data?.data || response?.data || response;
        reset({ name: cat.name, description: cat.description || '' });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load category');
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, reset]);

  const onSubmit = async (data) => {
    if (!user) return;

    try {
      await categoryService.updateCategory(id, data);
      navigate('/categories');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <Spinner />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Category
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Category Name"
            fullWidth
            margin="normal"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
            <Button variant="outlined" onClick={() => navigate('/categories')}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default EditCategory;
