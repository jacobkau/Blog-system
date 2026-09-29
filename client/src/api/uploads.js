import axios from 'axios';

const API_URL = 'https://blog-system-q65l.onrender.com/api/uploads/';

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

const uploadImage = async (formData) => {
  const response = await apiClient.post('', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default { uploadImage };
