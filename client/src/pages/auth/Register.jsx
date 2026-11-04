import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
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
  Paper,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  PersonOutlined,
  PersonAddOutlined,
} from '@mui/icons-material';
import useAuthContext from '../../context/useAuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, error } = useAuthContext();
  const navigate = useNavigate();

  const { name, email, password, passwordConfirm } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendWelcomeEmail = async (userName, userEmail) => {
    try {
      const templateParams = {
        to_email: userEmail,
        from_name: 'Witty Blog Team',
        subject: 'Welcome to Witty Blog!',
        message: [
          `Hi ${userName},`,
          '',
          'Welcome to the Witty Blog community! We are thrilled to have you on board.',
          '',
          'You can now start exploring, reading, and interacting with our content.',
          '',
          'Best regards,',
          'The Witty Highbrow Technologies Team',
          `© ${new Date().getFullYear()} wittyhighbrowtechnologies.com`,
        ].join('\n'),
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr?.text || emailErr?.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      await sendWelcomeEmail(name, email);
      toast.success('Registration successful!');
      setTimeout(() => navigate('/'), 1500);
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('https://blog-system-q65l.onrender.com/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        if (data.user?.email) {
          await sendWelcomeEmail(data.user.name, data.user.email);
        }
        toast.success('Registered & logged in with Google!');
        navigate('/');
      } else {
        toast.error(data.error || 'Google auth failed');
      }
    } catch (err) {
      toast.error('Network error during Google registration');
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
            <PersonAddOutlined fontSize="large" />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join our community to start writing and sharing
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          <TextField
            label="Full Name"
            name="name"
            value={name}
            onChange={onChange}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            autoComplete="name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlined color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={onChange}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined color="action" />
                </InputAdornment>
              ),
            }}
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
            disabled={loading}
            autoComplete="new-password"
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
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm Password"
            name="passwordConfirm"
            type={showPasswordConfirm ? 'text' : 'password'}
            value={passwordConfirm}
            onChange={onChange}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            autoComplete="new-password"
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
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5, borderRadius: 2, textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Sign up Failed')}
            shape="pill"
            width="100%"
            text="signup_with"
            use_fedcm_for_button={true} 
          />
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600} underline="hover">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
