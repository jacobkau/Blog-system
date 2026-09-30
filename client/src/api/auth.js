import axios from 'axios';

const API_URL = 'https://blog-system-q65l.onrender.com/api/auth/';

// axios instance 
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const register = async (userData) => {
  const response = await apiClient.post('register', userData);
  return response.data;
};

const login = async (userData) => {
  const response = await apiClient.post('login', userData);
  return response.data;
};

const logout = async () => {
  const response = await apiClient.get('logout');
  return response.data;
};

const getMe = async () => {
  const response = await apiClient.get('me');
  return { data: response.data.data || response.data.user || response.data };
};

//  Update name, email, bio, location, website
const updateDetails = async (data) => {
  const response = await apiClient.put('updatedetails', data);
  return response.data;
};

//  Change password
const updatePassword = async (data) => {
  const response = await apiClient.put('updatepassword', data);
  return response.data;
};
const forgotPassword = async (email) => {
  const response = await apiClient.post('forgot-password', { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await apiClient.put(`reset-password/${token}`, { password });
  return response.data;
};
// Upload avatar (requires backend route, see below)
const uploadAvatar = async (formData) => {
  const response = await apiClient.put('avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
};
