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

  // ✅ Load username from localStorage immediately
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    getUserProfile(token)
      .then((data) => {
        setUsername(data.firstName);
        localStorage.setItem("username", data.firstName);
      })
      .catch(() => {
        setUsername("User"); // fallback
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <AppBar position="static" className="navbar-root" elevation={0}>
      <Toolbar className="navbar-toolbar">
        {/* Left: Logo */}
        <Box component={Link} to="/home" className="navbar-logo">
          <img src={logo} alt="Logo" />
          <Typography variant="h6" className="navbar-logo-text">
            MatApp
          </Typography>
        </Box>

        {/* Center: Navigation Links */}
        <Box className="navbar-center-links">
          <Link to="/page1" className="navbar-link">
            Page 1
          </Link>
          <Link to="/page2" className="navbar-link">
            Page 2
          </Link>
          <Link to="/page3" className="navbar-link">
            Page 3
          </Link>
          <Link to="/features" className="navbar-link">
            Features
          </Link>
          <Link to="/aboutus" className="navbar-link">
            About Us
          </Link>
        </Box>

        {/* Right: Profile + Logout */}
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
