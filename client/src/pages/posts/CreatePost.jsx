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
  CircularProgress,
} from '@mui/material';
import postService from '../../api/posts';
import categoryService from '../../api/categories';
import { useAuthContext } from '../../context';
import RichTextEditor from '../../components/editor/RichTextEditor';
import FeaturedImageUploader from '../../components/posts/FeaturedImageUploader';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  excerpt: yup
    .string()
    .required('Excerpt is required')
    .max(200, 'Excerpt must be less than 200 characters'),
  category: yup.string().required('Please select exactly one category'), 
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
  const [contentHTML, setContentHTML] = useState('');
  const [featuredImage, setFeaturedImage] = useState('no-photo.jpg'); 
  
  const [selectOpen, setSelectOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { category: '' },
  });

  const selectedCategory = watch('category');

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
      setValue('category', preSelectedCategory, { shouldValidate: true });
    }
  }, [preSelectedCategory, setValue]);

  const handleCategoryChange = (event) => {
    setValue('category', event.target.value, { shouldValidate: true });
    setSelectOpen(false); 
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
        categories: [data.category], 
        featuredImage,
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

          <FormControl fullWidth margin="normal" error={!!errors.category}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              label="Category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              open={selectOpen}                  
              onOpen={() => setSelectOpen(true)} 
              onClose={() => setSelectOpen(false)}
            >
              {categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <Typography variant="caption" color="error">
                {errors.category.message}
              </Typography>
            )}
          </FormControl>

          <FeaturedImageUploader
            value={featuredImage}
            onChange={setFeaturedImage}
          />

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
