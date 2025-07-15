import axios from 'axios';

const API_URL = 'https://blog-system-q65l.onrender.com/api/posts/';

// Create axios instance with base config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add request interceptor for auth token
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

// Response interceptor for error handling
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
  try {
    console.log('Request params:', JSON.stringify(params, null, 2));
    const response = await apiClient.get('', { params });
    console.log('Full response structure:', {
      status: response.status,
      data: response.data,
      config: response.config
    });
    return response.data;
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// Get single post
const getPost = async (postId) => {
  const response = await apiClient.get(postId, {
    params: {
      include: 'author,categories,related'
    }
  });
  return response.data;
};

// Create new post
export const createPost = async (postData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/posts', postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Post creation error:', {
      message: error.response?.data?.message,
      status: error.response?.status
    });
    throw error;
  }
};

const updatePost = async (postId, postData) => {
  try {
    const response = await apiClient.put(`${postId}`, postData); // JSON body
    return response.data;
  } catch (error) {
    console.error('Post update error:', {
      message: error.response?.data?.message,
      status: error.response?.status
    });
    throw error;
  }
};

// Delete post
const deletePost = async (postId) => {
  const response = await apiClient.delete(postId);
  return response.data;
};


const getPostsByCategory = async (categoryId, params = {}) => {
  const response = await apiClient.get(`/category/${categoryId}`, { params });
  return response.data; 
};

// Get featured posts
const getFeaturedPosts = async (limit = 3) => {
  const response = await apiClient.get('', {
    params: {
      featured: true,
      limit
    }
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
