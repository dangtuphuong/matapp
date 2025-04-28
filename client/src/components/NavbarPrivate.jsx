import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import logo from "../img/onlylogo.png";
import { getUserProfile } from "../services/user-service";
import "./styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // Load username from localStorage initially
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  // Fetch user profile on initial render to update username
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Redirect to login if token is missing
    if (!token) {
      navigate("/login");
      return;
    }

    getUserProfile(token)
      .then((data) => {
        setUsername(data.firstName);
        localStorage.setItem("username", data.firstName); // Cache username
      })
      .catch(() => {
        setUsername("User"); // Fallback if profile fetch fails
      });
  }, []);

  // Handle logout: clear storage and redirect to login
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <AppBar position="static" className="navbar-root" elevation={0}>
      <Toolbar className="navbar-toolbar">
        {/* Left section: logo and title */}
        <Box component={Link} to="/home" className="navbar-logo">
          <img src={logo} alt="Logo" />
          <Typography variant="h6" className="navbar-logo-text">
            MatApp
          </Typography>
        </Box>

        {/* Center section: navigation links */}
        <Box className="navbar-center-links">
          <Link to="/smart-search" className="navbar-link">
            Smart Search
          </Link>
          <Link to="/home" className="navbar-link">
            Home
          </Link>
          <Link to="/search" className="navbar-link">
            Search
          </Link>
          <Link to="/aboutus" className="navbar-link">
            About Us
          </Link>
        </Box>

        {/* Right section: profile icon and logout button */}
        <Box className="navbar-right-group">
          <Box component={Link} to="/profile" className="navbar-profile-link">
            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
            <Typography variant="body1" className="navbar-username">
              {username}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleLogout}
            className="navbar-button"
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
