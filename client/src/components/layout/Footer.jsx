import { Box, Typography, Divider, Container, Link, Stack } from '@mui/material';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body2" color="text.secondary">
            © {year} Witty Blog Management System. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={3}>
            <Link href="/" underline="hover" color="text.secondary" variant="body2">
              Home
            </Link>
            <Link href="/posts" underline="hover" color="text.secondary" variant="body2">
              Posts
            </Link>
            <Link href="/categories" underline="hover" color="text.secondary" variant="body2">
              Categories
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
