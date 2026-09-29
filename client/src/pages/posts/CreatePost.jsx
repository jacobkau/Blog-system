import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import postService from '../../api/posts';
import categoryService from '../../api/categories';
import { useAuthContext } from '../../context';
import RichTextEditor from '../../components/editor/RichTextEditor';


const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  excerpt: yup
    .string()
    .required('Excerpt is required')
    .max(200, 'Excerpt must be less than 200 characters'),
  categories: yup.array().min(1, 'Select at least one category'),
});


const getTextLength = (html = '') =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;

const CreatePost = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedCategory = searchParams.get('category');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // ✅ Rich text content (HTML)
  const [contentHTML, setContentHTML] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { categories: [] },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setCategories(list);
      } catch (err) {
        console.error('Failed to load categories', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (preSelectedCategory) {
      setSelectedCategories([preSelectedCategory]);
      setValue('categories', [preSelectedCategory], { shouldValidate: true });
    }
  }, [preSelectedCategory, setValue]);

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    const safeArray = Array.isArray(value) ? value : [value];
    setSelectedCategories(safeArray);
    setValue('categories', safeArray, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }

  
    if (getTextLength(contentHTML) < 100) {
      setError('Content must be at least 100 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await postService.createPost({
        title: data.title,
        content: contentHTML, 
        excerpt: data.excerpt,
        categories: data.categories,
      });
      navigate('/posts');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error creating post';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Create New Post
        </Typography>

        {error && (
          <Typography color="error" paragraph>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            label="Excerpt"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            {...register('excerpt')}
            error={!!errors.excerpt}
            helperText={
              errors.excerpt?.message ||
              'Short preview shown in post listings (max 200 chars)'
            }
          />

          <FormControl fullWidth margin="normal" error={!!errors.categories}>
            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(Array.isArray(selected) ? selected : []).map((value) => (
                    <Chip
                      key={value}
                      label={categories.find((c) => c._id === value)?.name || value}
                    />
                  ))}
                </Box>
              )}
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {errors.categories && (
              <Typography variant="caption" color="error">
                {errors.categories.message}
              </Typography>
            )}
          </FormControl>

          {/*  content */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Content
            </Typography>
            <RichTextEditor
              value={contentHTML}
              onChange={setContentHTML}
              placeholder="Write your story... Click the image icon to upload from your device."
            />
            <Typography
              variant="caption"
              color={getTextLength(contentHTML) < 100 ? 'error' : 'text.secondary'}
              sx={{ mt: 1, display: 'block' }}
            >
              {getTextLength(contentHTML)} characters (min 100)
            </Typography>
          </Box>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/posts')}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default CreatePost;
