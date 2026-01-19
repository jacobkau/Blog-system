import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token') || null,
    user: null,
    error: null,
    loading: true,
    initialized: false
  });

  // Refs to track ongoing requests
  const loginRequestRef = useRef(null);
  const registerRequestRef = useRef(null);
  
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    // Prevent duplicate registration
    if (registerRequestRef.current) {
      return registerRequestRef.current;
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const requestPromise = (async () => {
      try {
        const response = await axios.post('https://blog-system-q65l.onrender.com/api/auth/register', userData);

        const token = response.data?.token;
        const user = response.data?.user;

        if (!token || !user) throw new Error('Missing token or user in response');

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

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
          'Registration failed! Please try again.';

        setAuthState(prev => ({ ...prev, error, loading: false, initialized: true }));
        throw new Error(error);
      } finally {
        registerRequestRef.current = null;
      }
    })();

    registerRequestRef.current = requestPromise;
    return requestPromise;
  }, []);

  const login = useCallback(async (credentials) => {
    // Prevent duplicate login
    if (loginRequestRef.current) {
      return loginRequestRef.current;
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const requestPromise = (async () => {
      try {
        const response = await axios.post('https://blog-system-q65l.onrender.com/api/auth/login', credentials);

        if (!response.data.token) throw new Error('No token received');

        const token = response.data.token;
        localStorage.setItem('token', token);

        // Get user data
        const userResponse = await axios.get('https://blog-system-q65l.onrender.com/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const user = {
          ...userResponse.data.data,
          id: userResponse.data.data._id 
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          token,
          user,
          error: null,
          loading: false,
          initialized: true
        });

        return response.data;
      } catch (err) {
        const error = err.response?.data?.error || 
                     err.response?.data?.message || 
                     'Login failed! Please check your credentials.';
        
        setAuthState(prev => ({ ...prev, error, loading: false, initialized: true }));
        throw new Error(error);
      } finally {
        loginRequestRef.current = null;
      }
    })();

    loginRequestRef.current = requestPromise;
    return requestPromise;
  }, []);

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
      
      localStorage.setItem('user', JSON.stringify(user));
      
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
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  // Auto-restore authentication
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setAuthState(prev => ({ 
            ...prev, 
            token, 
            user, 
            loading: false, 
            initialized: true 
          }));
          
          // Optionally validate token with backend
          // await getMe(token);
        } catch (error) {
          console.error('Error restoring auth:', error);
          localStorage.removeItem('user');
          setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
      }
    };

    initializeAuth();
  }, [getMe]);

  // Axios interceptors
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
