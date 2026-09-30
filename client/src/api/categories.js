import axios from 'axios';

const API_URL = 'https://blog-system-q65l.onrender.com/api/categories/';

// Create an axios instance with consistent config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  withCredentials: true,  
});

// Attach token from localStorage (Bearer fallback)
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

// Log errors for debugging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Get all categories
const getCategories = async () => {
  const response = await apiClient.get('');
  return response.data;
};

// Get single category
const getCategory = async (categoryId) => {
  const response = await apiClient.get(categoryId);
  return response.data;
};

// Create category
const createCategory = async (categoryData) => {
  const response = await apiClient.post('', categoryData);
  return response.data;
};

// Update category
const updateCategory = async (id, categoryData) => {
  const response = await apiClient.post(id, categoryData);
  return response.data; 
};

// Delete category
const deleteCategory = async (id) => {
  const response = await apiClient.delete(id);
  return response.data;
};

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
