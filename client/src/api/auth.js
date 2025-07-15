import axios from 'axios';

const API_URL = '/api/auth/';

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  return response.data;
};

// Logout user
const logout = async () => {
  const response = await axios.post(API_URL + 'logout');
  return response.data;
};

// getMe function
const getMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  
  const response = await axios.get(API_URL + 'me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Handle different response structures
  return {
    data: response.data.data || response.data.user || response.data
  };
};
export default {
  register,
  login,
  logout,
  getMe,
};