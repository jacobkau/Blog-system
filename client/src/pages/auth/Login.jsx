import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import { useAuthContext } from '../../context';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
  Link,
  Divider,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined, 
  EmailOutlined,
  LoginOutlined
} from '@mui/icons-material';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, googleLogin, error: authError } = useAuthContext();
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError('');
  };

  const validateForm = () => {
    if (!email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setLocalError('Password is required');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    setLocalError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      if (err.message?.includes('Network')) {
        setLocalError('Network error. Please check your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      toast.success('Logged in with Google!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Google auth failed');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <LoginOutlined fontSize="large" />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue to your account
          </Typography>
        </Box>

        {(authError || localError) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setLocalError('')}>
            {localError || authError}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={onChange}
            fullWidth
            margin="normal"
            required
            disabled={isSubmitting}
            autoComplete="email"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined color="action" />
                </InputAdornment>
              ),
            }}
            error={!!localError && localError.toLowerCase().includes('email')}
            helperText={localError.toLowerCase().includes('email') ? localError : ''}
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={onChange}
            fullWidth
            margin="normal"
            required
            disabled={isSubmitting}
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={!!localError && localError.toLowerCase().includes('password')}
            helperText={localError.toLowerCase().includes('password') ? localError : ''}
          />

          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isSubmitting || !email || !password}
            sx={{ mt: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Login Failed')}
            shape="pill"
            width="300" 
            text="continue_with"
            use_fedcm_for_button={true} 
          />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" fontWeight={600} underline="hover">
              Sign up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
