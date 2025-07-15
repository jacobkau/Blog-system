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
} from '@mui/material';
import postService from '../../api/posts';
import categoryService from '../../api/categories';
import { useAuthContext } from '../../context';
import Spinner from '../../components/ui/Spinner';

// Validation schema
const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  content: yup
    .string()
    .required('Content is required')
    .min(100, 'Content should be at least 100 characters'),
  excerpt: yup.string().max(200, 'Excerpt must be less than 200 characters'),
  categories: yup.array().min(1, 'Select at least one category'),
});

const getCategoryIds = (arr) =>
  arr.map((cat) =>
    typeof cat === 'object' && cat._id ? cat._id.toString() : cat.toString()
  );

const arraysEqual = (a, b) =>
  a.length === b.length && a.every((val) => b.includes(val));

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const postResponse = await postService.getPost(id);
        setPost(postResponse.data);

        const categoriesResponse = await categoryService.getCategories();
        setCategories(categoriesResponse.data);

        reset({
          title: postResponse.data.title,
          content: postResponse.data.content,
          excerpt: postResponse.data.excerpt,
          categories: getCategoryIds(postResponse.data.categories),
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load post data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset, user]);

  const onSubmit = async (data) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const preUpdate = await postService.getPost(id);
      console.log('Pre-update state:', preUpdate.data);

      const response = await postService.updatePost(
        id,
        { ...data, author: user.id },
        user.token
      );
      console.log('Update response:', response);

      const verification = await postService.getPost(id, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      console.log('Verification data:', verification.data);

      const changes = {
        title: verification.data.title !== preUpdate.data.title,
        excerpt: verification.data.excerpt !== preUpdate.data.excerpt,
        categories: !arraysEqual(
          getCategoryIds(verification.data.categories),
          getCategoryIds(preUpdate.data.categories)
        ),
      };

      console.log('Actual changes detected:', changes);

      if (!Object.values(changes).some((v) => v)) {
        throw new Error(
          'Database write verification failed - changes not persisted'
        );
      }

      navigate(`/posts/${id}`);
    } catch (err) {
      console.error('Update failed:', err);
      setError(
        err.message.includes('verification')
          ? 'Changes not saved to database (verify backend logs)'
          : err.message
      );
      setIsSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!post) return <Typography>Post not found</Typography>;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Post: {post.title}
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
            helperText={errors.excerpt?.message}
          />

          <FormControl fullWidth margin="normal">
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
                      label={
                        categories.find((c) => c._id === value)?.name || value
                      }
                    />
                  ))}
                </Box>
              )}
              error={!!errors.categories}
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

          <TextField
            label="Content"
            fullWidth
            margin="normal"
            multiline
            rows={12}
            {...register('content')}
            error={!!errors.content}
            helperText={errors.content?.message}
          />

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/posts/${id}`)}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default EditPost;
