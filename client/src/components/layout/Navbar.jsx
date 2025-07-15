import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Container,
} from "@mui/material";

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
              mr: 4,
            }}
          >
            Witty Blog Management System
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button component={Link} to="/" color="inherit">
              Home
            </Button>
            <Button component={Link} to="/posts" color="inherit">
              Posts
            </Button>
            <Button component={Link} to="/categories" color="inherit">
              Categories
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  component={Link}
                  to="/create-post"
                >
                  New Post
                </Button>
                <Button
                component={Link}
                  variant="contained"
                  size="small"
                  to="/create-category"
                >
                  New Category
                </Button>
                
                <Avatar
                  sx={{ bgcolor: "primary.main", cursor: "pointer" }}
                  onClick={() => navigate("/profile")}
                >
                  {user?.name?.charAt(0) || "U"}
                </Avatar>
                <Button color="inherit" onClick={onLogout} size="small">
                  Logout
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  to="/login"
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  component={Link}
                  to="/register"
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
