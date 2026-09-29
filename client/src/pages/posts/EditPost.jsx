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
import Spinner from '../../components/ui/Spinner';
import RichTextEditor from '../../components/editor/RichTextEditor';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  excerpt: yup
    .string()
    .required('Excerpt is required')
    .max(200, 'Excerpt must be less than 200 characters'),
  categories: yup.array().min(1, 'Select at least one category'),
});

const getCategoryIds = (arr = []) =>
  arr.map((cat) =>
    typeof cat === 'object' && cat._id ? cat._id.toString() : cat.toString()
  );

const getTextLength = (html = '') =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length;

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Content lives in its own state (HTML)
  const [contentHTML, setContentHTML] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      setError('Invalid post ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const postResponse = await postService.getPost(id);
        const fetchedPost = postResponse.data;
        setPost(fetchedPost);

        const categoriesResponse = await categoryService.getCategories();
        const catList = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : Array.isArray(categoriesResponse?.data)
          ? categoriesResponse.data
          : [];
        setCategories(catList);

        reset({
          title: fetchedPost.title,
          excerpt: fetchedPost.excerpt,
          categories: getCategoryIds(fetchedPost.categories || []),
        });

        
        setContentHTML(fetchedPost.content || '');

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            'Failed to load post data'
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, user]);

  const onSubmit = async (data) => {
    if (!user) return;

    if (getTextLength(contentHTML) < 100) {
      setError('Content must be at least 100 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await postService.updatePost(id, {
        title: data.title,
        content: contentHTML, 
        excerpt: data.excerpt,
        categories: data.categories,
      });
      navigate(`/posts/${id}`);
    } catch (err) {
      console.error('Update failed:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Failed to update post'
      );
      setIsSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error && !post) return <Typography color="error">{error}</Typography>;
  if (!post) return <Typography>Post not found</Typography>;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Edit Post
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
              value={watch('categories') || []}
              onChange={(e) =>
                setValue('categories', e.target.value, { shouldValidate: true })
              }
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
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

          {/* content */}
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
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/posts/${id}`)}>
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default EditPost;
