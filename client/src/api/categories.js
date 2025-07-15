import axios from 'axios';

const API_URL = 'https://blog-system-q65l.onrender.com/api/categories/';

// Get all categories
const getCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single category
const getCategory = async (categoryId) => {
  const response = await axios.get(API_URL + categoryId);
  return response.data;
};

// Create category (admin only)
const createCategory = async (categoryData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(API_URL, categoryData, config);
  return response.data;
};

export default {
  getCategories,
  getCategory,
  createCategory
};
