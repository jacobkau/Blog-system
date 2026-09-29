import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
} from "@mui/material";
import postService from "../../api/posts";
import categoryService from "../../api/categories";
import { useAuthContext } from "../../context";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  content: yup
    .string()
    .required("Content is required")
    .min(100, "Content should be at least 100 characters"),
  excerpt: yup.string().max(200, "Excerpt must be less than 200 characters"),
  categories: yup.array().min(1, "Select at least one category"),
});

const CreatePost = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedCategory = searchParams.get("category");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      categories: [],
    },
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
        console.error("Failed to load categories", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Pre-select category if ?category=xxx is in the URL
  useEffect(() => {
    if (preSelectedCategory) {
      setSelectedCategories([preSelectedCategory]);
      setValue("categories", [preSelectedCategory], { shouldValidate: true });
    }
  }, [preSelectedCategory, setValue]);

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    const safeArray = Array.isArray(value) ? value : [value];

    setSelectedCategories(safeArray);
    setValue("categories", safeArray, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await postService.createPost({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        categories: data.categories,
      });

      navigate("/posts");
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Error creating post";
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
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
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            label="Excerpt"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            {...register("excerpt")}
            error={!!errors.excerpt}
            helperText={errors.excerpt?.message}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(Array.isArray(selected) ? selected : []).map((value) => (
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
            {...register("content")}
            error={!!errors.content}
            helperText={errors.content?.message}
          />

          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default CreatePost;
