import axios from 'axios';

const API_URL = 'https://blog-system-q65l.onrender.com/api/posts/';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  withCredentials: true,
});

// Attach JWT from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized access - please login');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    }
    return Promise.reject(error);
  }
);

// Get all posts
const getPosts = async (params = {}) => {
  const response = await apiClient.get('', { params });
  return response.data;
};

// Get single post
const getPost = async (postId) => {
  if (!postId) throw new Error('postId is required');
  const response = await apiClient.get(postId);
  return response.data;
};

// Create new post
const createPost = async (postData) => {
  const response = await apiClient.post('', postData);
  return response.data;
};

// Update post
const updatePost = async (postId, postData) => {
  const response = await apiClient.post(postId, postData);
  return response.data;
};

// Delete post
const deletePost = async (postId) => {
  const response = await apiClient.delete(postId);
  return response.data;
};

// Get posts by category
const getPostsByCategory = async (categoryId, params = {}) => {
  const response = await apiClient.get(`category/${categoryId}`, { params });
  return response.data;
};

// Get featured posts
const getFeaturedPosts = async (limit = 3) => {
  const response = await apiClient.get('', {
    params: { featured: true, limit },
  });
  return response.data;
};

export default {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostsByCategory,
  getFeaturedPosts
};
