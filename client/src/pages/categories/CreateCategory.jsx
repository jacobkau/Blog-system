import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Box
} from '@mui/material';

const CreateCategory = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');



const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setMessage('');

  console.log('Making request to:', 'https://blog-system-q65l.onrender.com/api/categories');
  console.log('With data:', { name, description });

  try {
    const res = await axios.post(
      'https://blog-system-q65l.onrender.com/api/categories', 
      { name, description },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Response:', res);
    console.log('Response data:', res.data);
    
    // Your backend returns data in res.data.data
    setMessage(`Category "${res.data.data?.name}" created successfully!`);
    setName('');
    setDescription('');
  } catch (err) {
    console.error('Full error:', err);
    console.error('Error response:', err.response);
    
    let errorMessage = 'Failed to create category';
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = err.response.data?.error || 
                    err.response.data?.message || 
                    `Server error: ${err.response.status}`;
    } else if (err.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Check network connection.';
    } else {
      // Something happened in setting up the request
      errorMessage = err.message;
    }
    
    setError(errorMessage);
  }
};



  

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Create New Category
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Category Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          label="Category Description"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          margin="normal"
        />

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ my: 2 }}>
            {message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Create Category
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CreateCategory;
