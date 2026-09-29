import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  People,
  Create,
  Book,
  TrendingUp,
} from '@mui/icons-material';
import { useAuthContext } from '../context';

/* ============================================================
   Features Section
   ============================================================ */
const Features = ({ features }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 8 }}>
      {/* Section heading */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography
          variant="overline"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 700,
            letterSpacing: 2,
            display: 'block',
            mb: 1,
          }}
        >
          FEATURES
        </Typography>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 700, mb: 1.5 }}
        >
          Why Choose Our Platform
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Everything you need to publish, manage, and grow your blog — all in one place.
        </Typography>
      </Box>

      {/* Feature cards */}
      <Grid
        container
        spacing={3}
        sx={{ alignItems: 'stretch' }}
      >
        {features.map((feature, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={feature.title || index}
            sx={{ display: 'flex' }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 3,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.background.paper,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: theme.shadows[6],
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {/* Icon in a soft colored circle */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: `${theme.palette.primary.main}14`,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: '1.75rem',
                  transition: 'transform 0.3s ease',
                  '.MuiPaper-root:hover &': {
                    transform: 'scale(1.08)',
                  },
                }}
              >
                {feature.icon}
              </Box>

              <Typography
                variant="h6"
                component="h3"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                {feature.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                {feature.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

/* ============================================================
   Home Page
   ============================================================ */
const Home = () => {
  const { user } = useAuthContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expandedPanel, setExpandedPanel] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const features = [
    {
      title: 'Easy Content Creation',
      icon: <Create fontSize="inherit" />,
      description: 'Our intuitive editor makes writing and formatting posts a breeze.',
    },
    {
      title: 'Engage With Community',
      icon: <People fontSize="inherit" />,
      description: 'Connect with like-minded individuals through comments and reactions.',
    },
    {
      title: 'Organized Content',
      icon: <Book fontSize="inherit" />,
      description: 'Categorize your posts for better discoverability.',
    },
    {
      title: 'Grow Your Audience',
      icon: <TrendingUp fontSize="inherit" />,
      description: 'Reach readers who are passionate about your topics.',
    },
  ];

  const howItWorks = [
    'Sign up for a free account',
    'Create your profile',
    'Start writing posts',
    'Engage with readers',
    'Build your following',
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      {/* ================================
          Hero Section
         ================================ */}
      <Box
        sx={{
          textAlign: 'center',
          p: isMobile ? 4 : 6,
          mb: 6,
          borderRadius: 2,
          color: theme.palette.mode === 'dark' ? '#fff' : '#1a2027',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
              : 'linear-gradient(135deg, #e0e7ff 0%, #c3cfe2 100%)',
        }}
      >
        <Typography
          variant={isMobile ? 'h3' : 'h2'}
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          {user?.name ? `Welcome back, ${user.name}!` : 'Welcome to WittyMart!'}
        </Typography>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ opacity: 0.85, mb: 2 }}
        >
          A platform designed for passionate writers and curious readers
        </Typography>
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/posts"
            sx={{ px: 4 }}
          >
            Browse Posts
          </Button>
          {!user && (
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/register"
              sx={{
                px: 4,
                borderColor: 'currentColor',
                color: 'inherit',
              }}
            >
              Join Now
            </Button>
          )}
        </Box>
      </Box>

      {/* ================================
          Features Section
         ================================ */}
      <Features features={features} />

      {/* ================================
          How It Works + FAQ (side by side)
         ================================ */}
      <Grid
        container
        spacing={4}
        sx={{ mb: 6, alignItems: 'flex-start' }}
      >
        {/* Left: How It Works */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}
          >
            How It Works
          </Typography>
          <Box sx={{ mx: 'auto' }}>
            <List sx={{ width: '100%' }}>
              {howItWorks.map((step, index) => (
                <ListItem
                  key={index}
                  disableGutters
                  sx={{ py: 1.5, alignItems: 'flex-start' }}
                >
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    <CheckCircle color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={step}
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>

        {/* Right: FAQ */}
        <Grid item xs={12} md={8}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}
          >
            Frequently Asked Questions
          </Typography>
          <Box sx={{ mx: 'auto' }}>
            <Accordion
              expanded={expandedPanel === 'panel1'}
              onChange={handleAccordionChange('panel1')}
              disableGutters
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={500}>
                  Is this platform free to use?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Yes! Our basic features are completely free forever. We may
                  offer premium features in the future, but core functionality
                  will always remain free.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanel === 'panel2'}
              onChange={handleAccordionChange('panel2')}
              disableGutters
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={500}>
                  Can I write about any topic?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  You can write about any appropriate topic that follows our
                  community guidelines. We encourage diverse perspectives and
                  meaningful discussions.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedPanel === 'panel3'}
              onChange={handleAccordionChange('panel3')}
              disableGutters
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight={500}>
                  How do I get more readers?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Consistently create quality content, engage with other writers,
                  use relevant categories, and share your posts on social media
                  to grow your audience.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grid>
      </Grid>

      {/* ================================
          Final Call to Action
         ================================ */}
      <Box
        sx={{
          textAlign: 'center',
          p: isMobile ? 3 : 6,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
        }}
      >
        <Typography
          variant="h4"
          component="h3"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Ready to begin your writing journey?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          {user
            ? 'Start creating content and connecting with readers today!'
            : 'Join our community of writers and readers today - it only takes a minute to sign up!'}
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to={user ? '/create-post' : '/register'}
          sx={{ px: 6, mb: 2 }}
        >
          {user ? 'Create Your First Post' : 'Get Started Free'}
        </Button>
        {user && (
          <Typography variant="body2" color="text.secondary">
            or{' '}
            <Link
              to="/posts"
              style={{
                color: theme.palette.primary.main,
                textDecoration: 'underline',
              }}
            >
              browse existing posts
            </Link>
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Home;
