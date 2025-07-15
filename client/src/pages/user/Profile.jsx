import {  useState } from 'react';
import { Container, Typography, Box, Button, TextField, Avatar } from '@mui/material';
import { useAuthContext } from '../../context'; 

const Profile = () => {
  const { user, logout } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update profile logic would go here
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5">Please login to view your profile</Typography>
        <Button variant="contained" href="/login" sx={{ mt: 2 }}>
          Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Your Profile</Typography>
        <Button variant="outlined" onClick={logout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 3 }}>
        <Avatar sx={{ width: 100, height: 100, fontSize: 40 }}>
          {user.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h5">{user.name}</Typography>
          <Typography variant="body1" color="text.secondary">
            {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {isEditing ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
            <Button variant="outlined" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        </Box>
      )}

      {/* <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Your Activity
        </Typography>
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography>Your posts: 0</Typography>
          <Typography>Your comments: 0</Typography>
        </Box>
      </Box> */}
    </Container>
  );
};

export default Profile;