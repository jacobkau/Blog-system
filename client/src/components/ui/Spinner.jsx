import { CircularProgress, Box } from '@mui/material';

const Spinner = ({ size = 40 }) => (
  <Box 
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    }}
  >
    <CircularProgress size={size} />
  </Box>
);

export default Spinner;