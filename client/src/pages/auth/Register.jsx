import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from '@emailjs/browser';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import useAuthContext from '../../context/useAuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
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
      // Register the user 
      await register({ name, email, password });
      //  Send welcome email — don't fail registration if the email fails
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID,
          {
            to_name: name,
            to_email: email,
            from_name: 'Witty Blog Team',
            site_url: window.location.origin,
            current_year: new Date().getFullYear(),
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        // Log quietly — user is registered regardless
        console.error('Welcome email failed:', emailErr?.text || emailErr?.message);
      }

      toast.success('Registration successful!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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

        {/* Login link */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
