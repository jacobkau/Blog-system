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
  useMediaQuery
} from '@mui/material';
import { 
  ExpandMore,
  CheckCircle,
  People,
  Create,
  Book,
  TrendingUp
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../context'; 

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
      title: "Easy Content Creation",
      icon: <Create color="primary" />,
      description: "Our intuitive editor makes writing and formatting posts a breeze."
    },
    {
      title: "Engage With Community",
      icon: <People color="primary" />,
      description: "Connect with like-minded individuals through comments and reactions."
    },
    {
      title: "Organized Content",
      icon: <Book color="primary" />,
      description: "Categorize your posts for better discoverability."
    },
    {
      title: "Grow Your Audience",
      icon: <TrendingUp color="primary" />,
      description: "Reach readers who are passionate about your topics."
    }
  ];

  const howItWorks = [
    "Sign up for a free account",
    "Create your profile",
    "Start writing posts",
    "Engage with readers",
    "Build your following"
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center',
        p: isMobile ? 4 : 6,
        mb: 6,
        borderRadius: 2,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' 
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
        <Typography variant={isMobile ? "h3" : "h2"} component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome {user?.name && `back, ${user.name}`}!
        </Typography>
        <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary" paragraph>
          A platform designed for passionate writers and curious readers
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
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
              sx={{ px: 4 }}
            >
              Join Now
            </Button>
          )}
        </Box>
      </Box>

      {/* Platform Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Why Choose Our Platform
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" component="h3" sx={{ ml: 1.5 }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* How It Works */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          How It Works
        </Typography>
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <List>
            {howItWorks.map((step, index) => (
              <ListItem key={index} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <CheckCircle color="primary" />
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          Frequently Asked Questions
        </Typography>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Accordion expanded={expandedPanel === 'panel1'} onChange={handleAccordionChange('panel1')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={500}>Is this platform free to use?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Yes! Our basic features are completely free forever. We may offer premium features in the future, but core functionality will always remain free.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expandedPanel === 'panel2'} onChange={handleAccordionChange('panel2')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={500}>Can I write about any topic?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                You can write about any appropriate topic that follows our community guidelines. We encourage diverse perspectives and meaningful discussions.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expandedPanel === 'panel3'} onChange={handleAccordionChange('panel3')}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography fontWeight={500}>How do I get more readers?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Consistently create quality content, engage with other writers, use relevant categories, and share your posts on social media to grow your audience.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>

      {/* Final Call to Action */}
      <Box sx={{ 
        textAlign: 'center',
        p: isMobile ? 3 : 6,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper
      }}>
        <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          Ready to begin your writing journey?
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          {user 
            ? "Start creating content and connecting with readers today!" 
            : "Join our community of writers and readers today - it only takes a minute to sign up!"}
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          component={Link} 
          to={user ? "/create-post" : "/register"}
          sx={{ px: 6, mb: 2 }}
        >
          {user ? 'Create Your First Post' : 'Get Started Free'}
        </Button>
        {user && (
          <Typography variant="body2" color="text.secondary">
            or <Link to="/posts" style={{ color: theme.palette.primary.main }}>browse existing posts</Link>
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Home;
