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
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { useAuthContext } from '../../context';
import authService from '../../api/auth';

const normalizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const Profile = () => {
  const { user, logout, setAuthState } = useAuthContext();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
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

  
  const handleWebsiteBlur = (e) => {
    const val = e.target.value.trim();
    if (val && !/^https?:\/\//i.test(val)) {
      setFormData((prev) => ({ ...prev, website: `https://${val}` }));
    }
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
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to update profile'
      );
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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return toast.error('Please type DELETE to confirm');
    }

    setDeleting(true);
    try {
      await authService.deleteAccount();
      toast.success('Your account has been deleted');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthState({
        token: null,
        user: null,
        error: null,
        loading: false,
        initialized: true,
      });

      setDeleteDialogOpen(false);
      navigate('/');
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Failed to delete account'
      );
    } finally {
      setDeleting(false);
    }
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

          <Box
  sx={{
    flex: 1,
    minWidth: 200,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: 1.5,
    rowGap: 0.5,
  }}
>
  <Typography variant="body2" fontWeight={600}>Email:</Typography>
  <Typography variant="body2" color="text.secondary">{user.email}</Typography>

  {user.location && (
    <>
      <Typography variant="body2" fontWeight={600}>Location:</Typography>
      <Typography variant="body2" color="text.secondary">{user.location}</Typography>
    </>
  )}

  {user.website && (
    <>
      <Typography variant="body2" fontWeight={600}>Website:</Typography>
      <Typography variant="body2" color="text.secondary">
        <a
          href={normalizeUrl(user.website)}
          target="_blank"
          rel="noreferrer noopener"
          style={{ color: 'inherit' }}
        >
          {user.website}
        </a>
      </Typography>
    </>
  )}

  <Typography variant="body2" fontWeight={600}>Member since:</Typography>
  <Typography variant="body2" color="text.secondary">
    {new Date(user.createdAt).toLocaleDateString()}
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
              onBlur={handleWebsiteBlur}
              fullWidth
              margin="normal"
              placeholder="https://your-site.com"
              helperText="Include https:// (we'll add it if you forget)"
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

      {/* Danger zone */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'error.main',
          bgcolor: 'error.main',
          color: 'error.contrastText',
          opacity: 0.95,
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Danger Zone
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
          Once you delete your account, there is no going back. All your posts,
          comments, and data will be permanently removed.
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={() => {
            setDeleteConfirmText('');
            setDeleteDialogOpen(true);
          }}
          sx={{
            bgcolor: 'background.paper',
            color: 'error.main',
            '&:hover': { bgcolor: 'grey.100' },
          }}
        >
          Delete My Account
        </Button>
      </Paper>

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

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
          Delete Account
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            This action is <strong>permanent</strong> and cannot be undone. All
            your posts, comments, and account data will be deleted.
          </DialogContentText>
          <DialogContentText sx={{ mb: 3 }}>
            To confirm, type <strong>DELETE</strong> in the box below:
          </DialogContentText>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
            disabled={deleting}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={deleteConfirmText !== 'DELETE' || deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteForeverIcon />
              )
            }
          >
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
