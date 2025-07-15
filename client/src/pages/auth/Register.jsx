import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import useAuthContext from '../../context/useAuthContext';

const Register = () => {
  // Proper hook declarations at the top level
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, error } = useAuthContext();
  const navigate = useNavigate();

  const { name, email, password, passwordConfirm } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const onSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;
  
  if (password !== passwordConfirm) {
    toast.error('Passwords do not match');
    return;
  }

  setLoading(true);
  try {
    await register({ name, email, password });
    toast.success('Registration successful! Redirecting...');
    setTimeout(() => navigate('/'), 2000);
  } catch (err) {
    const errorMsg = err.response?.data?.error || 
                    err.message || 
                    'Registration failed! Please try a new Email / Name';
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Account
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join our community
        </Typography>
      </Box>
      
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          label="Full Name"
          name="name"
          value={name}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Confirm Password"
          name="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
        </Button>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Already have an account? <Link href="/login">Sign in</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;