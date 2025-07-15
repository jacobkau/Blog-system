import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token') || null,
    user: null,
    error: null,
    loading: false
  });

  const navigate = useNavigate();

  // Memoized logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({
      token: null,
      user: null,
      error: null,
      loading: false
    });
    navigate('/login');
  }, [navigate]);

 const register = useCallback(async (userData) => {
  setAuthState(prev => ({ ...prev, loading: true }));
  try {
    const response = await axios.post('https://blog-system-q65l.onrender.com/api/auth/register', userData);

    const token = response.data?.token;
    const user = response.data?.user;

    if (!token || !user) throw new Error('Missing token or user in response');

    localStorage.setItem('token', token);

    setAuthState({
      token,
      user,
      error: null,
      loading: false,
    });

    return response.data;
  } catch (err) {
    const error =
      err.response?.data?.error ||
      err.response?.data?.message || // fallback if using `message`
      'Registration failed! Please try a new Email / Name';

    setAuthState(prev => ({ ...prev, error, loading: false }));
    throw new Error(error);
  }
}, []);

const login = useCallback(async (credentials) => {
  setAuthState(prev => ({ ...prev, loading: true }));
  try {
    const response = await axios.post('https://blog-system-q65l.onrender.com/api/auth/login', credentials);

    if (!response.data.token) throw new Error('No token received');

    localStorage.setItem('token', response.data.token);

    const userResponse = await axios.get('https://blog-system-q65l.onrender.com/api/auth/me', {
      headers: {
        Authorization: `Bearer ${response.data.token}`
      }
    });
const user = {
  ...userResponse.data.data,
  id: userResponse.data.data._id 
};
    setAuthState({
      token: response.data.token,
      user,
      error: null,
      loading: false
    });

    return response.data;
  } catch (err) {
    const error = err.response?.data?.error || 'Login failed!';
    setAuthState(prev => ({ ...prev, error, loading: false }));
    throw new Error(error);
  }
}, []);

  // Memoized getMe function
  const getMe = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.get('https://blog-system-q65l.onrender.com/api/auth/me');
      setAuthState(prev => ({
        ...prev,
        user: response.data,
        error: null,
        loading: false
      }));
      return response.data;
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to fetch user data';
      setAuthState(prev => ({ ...prev, error, loading: false }));
      logout();
      throw err;
    }
  }, [logout]);

  // Axios interceptors setup
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        if (authState.token) {
          config.headers.Authorization = `Bearer ${authState.token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [authState.token, logout]);

  return {
    ...authState,
    register,
    login,
    logout,
    getMe,
    setAuthState
  };
};
