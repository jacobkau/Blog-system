import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  Paper,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuthContext } from '../../context';
import authService from '../../api/auth';

const Profile = () => {
  const { user, logout, setAuthState } = useAuthContext();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
  });

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Keep form in sync if user updates elsewhere
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePwdChange = (e) => {
    setPwdData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await authService.updateDetails({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
      });

      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update context so navbar & everywhere else reflects new name
      setAuthState((prev) => ({ ...prev, user: updatedUser }));

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (pwdData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setSaving(true);
    try {
      await authService.updatePassword({
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword,
      });
      toast.success('Password updated successfully');
      setPwdDialogOpen(false);
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to update password'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image must be smaller than 2MB');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);
    try {
      const response = await authService.uploadAvatar(formData);
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Avatar upload failed'
      );
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out');
    navigate('/login');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Please login to view your profile</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          Your Profile
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Profile card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar with upload overlay */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user.avatar || undefined}
              sx={{
                width: 120,
                height: 120,
                fontSize: 48,
                bgcolor: 'primary.main',
              }}
            >
              {user.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <IconButton
              onClick={handleAvatarClick}
              disabled={avatarUploading}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              size="small"
            >
              {avatarUploading ? (
                <CircularProgress size={16} />
              ) : (
                <PhotoCameraIcon fontSize="small" />
              )}
            </IconButton>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarUpload}
            />
          </Box>

          {/* Basic info */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h5" fontWeight={600}>
                {user.name}
              </Typography>
              {user.role === 'admin' && (
                <Chip label="Admin" color="primary" size="small" />
              )}
            </Box>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
            {user.location && (
              <Typography variant="body2" color="text.secondary">
                📍 {user.location}
              </Typography>
            )}
            {user.website && (
              <Typography variant="body2" color="text.secondary">
                🔗{' '}
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'inherit' }}
                >
                  {user.website}
                </a>
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {user.bio && !isEditing && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1">{user.bio}</Typography>
          </>
        )}
      </Paper>

      {/* Edit form / actions */}
      {isEditing ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Edit Profile
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              inputProps={{ maxLength: 250 }}
              helperText={`${formData.bio.length}/250`}
            />
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              fullWidth
              margin="normal"
              placeholder="https://your-site.com"
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} /> : null}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
          <Button
            variant="outlined"
            startIcon={<LockIcon />}
            onClick={() => setPwdDialogOpen(true)}
          >
            Change Password
          </Button>
        </Box>
      )}

      {/* Password change dialog */}
      <Dialog
        open={pwdDialogOpen}
        onClose={() => setPwdDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Change Password
          <IconButton
            onClick={() => setPwdDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Current Password"
            name="currentPassword"
            type="password"
            value={pwdData.currentPassword}
            onChange={handlePwdChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="New Password"
            name="newPassword"
            type="password"
            value={pwdData.newPassword}
            onChange={handlePwdChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={pwdData.confirmPassword}
            onChange={handlePwdChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
