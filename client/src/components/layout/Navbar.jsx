import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Badge,
  Chip,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import CategoryIcon from "@mui/icons-material/Category";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
  };

  // Mobile drawer content
const drawerContent = (
  <Box sx={{ width: 280, height: "100%" }} role="presentation">
    {/* Logo and title */}
    <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: 2,
          border: '2px solid',
          borderColor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="img"
          src="/logo.png"
          alt="Witty Blog Logo"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            // Fallback to colored background
            e.target.style.display = 'none';
            e.target.parentElement.style.backgroundColor = 'primary.main';
            e.target.parentElement.innerHTML = '<ArticleIcon style={{color: "white"}} />';
          }}
        />
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700} lineHeight={1}>
          Witty Blog
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Management System
        </Typography>
      </Box>
    </Box>
    
    <Divider />
      
      {/* Navigation links */}
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/" onClick={handleDrawerToggle}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/posts" onClick={handleDrawerToggle}>
            <ListItemIcon>
              <ArticleIcon />
            </ListItemIcon>
            <ListItemText primary="Posts" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/categories" onClick={handleDrawerToggle}>
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </ListItemButton>
        </ListItem>
        
        {user?.role === "admin" && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/dashboard" onClick={handleDrawerToggle}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      
      <Divider />
      
      {/* User actions */}
      <List>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/create-post" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="New Post" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/create-category" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="New Category" />
              </ListItemButton>
            </ListItem>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/profile" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/register" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <AppRegistrationIcon />
                </ListItemIcon>
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
      
      {/* User info at bottom */}
      {user && (
        <>
          <Divider />
          <Box sx={{ p: 2, bgcolor: "action.hover" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user?.name || user?.username || "User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            {user?.role && (
              <Chip 
                label={user.role} 
                size="small" 
                color={user.role === "admin" ? "error" : "primary"}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={1}
        sx={{ 
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.9)"
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: { xs: 1, md: 0 } }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Logo - responsive */}
            <Typography
              variant={isMobile ? "h6" : "h5"}
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: "primary.main",
                fontWeight: 700,
                mr: { xs: 2, md: 4 },
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: "primary.main", 
                  width: { xs: 30, md: 36 }, 
                  height: { xs: 30, md: 36 },
                  display: { xs: "none", sm: "flex" }
                }}
              >
                <ArticleIcon fontSize={isMobile ? "small" : "medium"} />
              </Avatar>
              <Box component="span" sx={{ 
                display: { xs: "none", sm: "block" } 
              }}>
                Witty Blog
              </Box>
              <Box component="span" sx={{ 
                display: { xs: "block", sm: "none" },
                fontSize: "0.9rem"
              }}>
                WB
              </Box>
            </Typography>

            {/* Desktop navigation */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
                <Button 
                  component={Link} 
                  to="/" 
                  startIcon={<HomeIcon />}
                  sx={{ 
                    textTransform: "none",
                    fontWeight: 500,
                    px: 2
                  }}
                >
                  Home
                </Button>
                <Button 
                  component={Link} 
                  to="/posts" 
                  startIcon={<ArticleIcon />}
                  sx={{ 
                    textTransform: "none",
                    fontWeight: 500,
                    px: 2
                  }}
                >
                  Posts
                </Button>
                <Button 
                  component={Link} 
                  to="/categories" 
                  startIcon={<CategoryIcon />}
                  sx={{ 
                    textTransform: "none",
                    fontWeight: 500,
                    px: 2
                  }}
                >
                  Categories
                </Button>
                {user?.role === "admin" && (
                  <Button 
                    component={Link} 
                    to="/dashboard" 
                    startIcon={<DashboardIcon />}
                    sx={{ 
                      textTransform: "none",
                      fontWeight: 500,
                      px: 2
                    }}
                  >
                    Dashboard
                  </Button>
                )}
              </Box>
            )}

            {/* Desktop user actions */}
            {!isMobile ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {user ? (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      component={Link}
                      to="/create-post"
                      size="small"
                      sx={{ 
                        textTransform: "none",
                        borderRadius: 2
                      }}
                    >
                      New Post
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      component={Link}
                      to="/create-category"
                      size="small"
                      sx={{ 
                        textTransform: "none",
                        borderRadius: 2
                      }}
                    >
                      New Category
                    </Button>
                    
                    <Tooltip title="Account">
                      <IconButton
                        onClick={handleProfileMenuOpen}
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          variant="dot"
                          color="success"
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: "primary.main",
                              cursor: "pointer",
                              border: "2px solid",
                              borderColor: "background.paper"
                            }}
                          >
                            {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                          </Avatar>
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    
                    <Menu
                      anchorEl={profileAnchorEl}
                      open={Boolean(profileAnchorEl)}
                      onClose={handleProfileMenuClose}
                      PaperProps={{
                        elevation: 3,
                        sx: {
                          mt: 1.5,
                          minWidth: 200,
                          borderRadius: 2,
                          overflow: "visible",
                          "&:before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: "right", vertical: "top" }}
                      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {user?.name || user?.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user?.email}
                        </Typography>
                      </Box>
                      <Divider />
                      <MenuItem 
                        component={Link} 
                        to="/profile" 
                        onClick={handleProfileMenuClose}
                      >
                        <ListItemIcon>
                          <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        Profile
                      </MenuItem>
                      {user?.role === "admin" && (
                        <MenuItem 
                          component={Link} 
                          to="/dashboard" 
                          onClick={handleProfileMenuClose}
                        >
                          <ListItemIcon>
                            <DashboardIcon fontSize="small" />
                          </ListItemIcon>
                          Dashboard
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<LoginIcon />}
                      component={Link}
                      to="/login"
                      size="small"
                      sx={{ 
                        textTransform: "none",
                        borderRadius: 2
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AppRegistrationIcon />}
                      component={Link}
                      to="/register"
                      size="small"
                      sx={{ 
                        textTransform: "none",
                        borderRadius: 2
                      }}
                    >
                      Register
                    </Button>
                  </Box>
                )}
              </Box>
            ) : (
              /* Mobile user actions (avatar only) */
              user && (
                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end" }}>
                  <IconButton onClick={handleProfileMenuOpen} size="small">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "primary.main",
                        fontSize: "0.875rem"
                      }}
                    >
                      {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </Avatar>
                  </IconButton>
                </Box>
              )
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;
