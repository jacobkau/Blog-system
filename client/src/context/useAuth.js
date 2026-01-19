// src/context/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token') || null,
    user: null,
    error: null,
    loading: true, // Start with loading true
    initialized: false // Track if auth is initialized
  });

  const navigate = useNavigate();

  // Memoized logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({
      token: null,
      user: null,
      error: null,
      loading: false,
      initialized: true
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
        initialized: true
      });

      return response.data;
    } catch (err) {
      const error =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed! Please try a new Email / Name';

      setAuthState(prev => ({ ...prev, error, loading: false, initialized: true }));
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
        loading: false,
        initialized: true
      });

      return response.data;
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed!';
      setAuthState(prev => ({ ...prev, error, loading: false, initialized: true }));
      throw new Error(error);
    }
  }, []);

  // Updated getMe function
  const getMe = useCallback(async (token = authState.token) => {
    if (!token) {
      setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
      return null;
    }
    
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      const response = await axios.get('https://blog-system-q65l.onrender.com/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const user = {
        ...response.data.data,
        id: response.data.data._id 
      };
      
      setAuthState(prev => ({
        ...prev,
        user,
        error: null,
        loading: false,
        initialized: true
      }));
      
      return user;
    } catch (err) {
      console.error('getMe error:', err);
      
      // If 401, clear invalid token
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setAuthState(prev => ({
          token: null,
          user: null,
          error: null,
          loading: false,
          initialized: true
        }));
      } else {
        const error = err.response?.data?.error || 'Failed to fetch user data';
        setAuthState(prev => ({ ...prev, error, loading: false, initialized: true }));
      }
      return null;
    }
  }, [authState.token]);

  // NEW: Auto-restore authentication on mount/refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Validate and restore user data
        await getMe(token);
      } else {
        // No token, set as initialized
        setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
      }
    };

    initializeAuth();
  }, [getMe]);

  // Axios interceptors setup - FIXED to prevent circular dependency
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Don't call logout here to prevent infinite loops
          localStorage.removeItem('token');
          setAuthState({
            token: null,
            user: null,
            error: null,
            loading: false,
            initialized: true
          });
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Request interceptor
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  return {
    ...authState,
    register,
    login,
    logout,
    getMe,
    setAuthState
  };
};
