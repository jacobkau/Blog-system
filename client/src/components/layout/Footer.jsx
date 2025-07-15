import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 4, bgcolor: 'background.paper', mt: 'auto' }}>
      <Container maxWidth="xl">
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} MERN Blog App. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;