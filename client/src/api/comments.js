import axios from 'axios';

const API_URL = 'https://blog-system-q65l.onrender.com/api/posts/';

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

const getComments = async (postId) => {
  const res = await apiClient.get(`${postId}/comments`);
  return res.data;
};

const addComment = async (postId, text) => {
  const res = await apiClient.post(`${postId}/comments`, { text });
  return res.data;
};

const deleteComment = async (postId, commentId) => {
  const res = await apiClient.delete(`${postId}/comments/${commentId}`);
  return res.data;
};

export default { getComments, addComment, deleteComment };
