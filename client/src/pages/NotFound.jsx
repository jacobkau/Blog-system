import { Link } from 'react-router-dom';
import { Container, Box, Typography, Button } from '@mui/material';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h1" component="h1" sx={{ fontSize: '8rem', fontWeight: 700, mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button 
          variant="contained" 
          component={Link} 
          to="/" 
          size="large"
          sx={{ mr: 2 }}
        >
          Go to Homepage
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => window.history.back()} 
          size="large"
        >
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;