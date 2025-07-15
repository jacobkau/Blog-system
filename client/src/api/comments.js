import axios from 'axios';

const API_URL = '/api/comments/';

const getComments = async (postId) => {
  return axios.get(`${API_URL}${postId}`);
};

const createComment = async (postId, commentData, token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await axios.post(`${API_URL}/${postId}`, { text: commentData.text }, config);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error.response?.data);
    throw error;
  }
};

export default {
  getComments,
  createComment
};
