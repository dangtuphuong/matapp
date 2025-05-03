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

//Import icons
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt"; // Smart Search
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import UploadIcon from "@mui/icons-material/Upload";
import InfoIcon from "@mui/icons-material/Info";

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
    localStorage.removeItem("first_login");
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#1a1a1a",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
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
          <Link to="/home" className="navbar-link">
            <HomeIcon fontSize="small" style={{ marginRight: "5px" }} />
            Home
          </Link>
          <Link to="/search" className="navbar-link">
            <SearchIcon fontSize="small" style={{ marginRight: "5px" }} />
            Search
          </Link>
          <Link to="/smart-search" className="navbar-link">
            <PsychologyAltIcon
              fontSize="small"
              style={{ marginRight: "5px" }}
            />
            Smart Search
          </Link>
          <Link to="/compare" className="navbar-link">
            <CompareArrowsIcon
              fontSize="small"
              style={{ marginRight: "5px" }}
            />
            Compare
          </Link>
          <Link to="/upload" className="navbar-link">
            <UploadIcon fontSize="small" style={{ marginRight: "5px" }} />
            Upload
          </Link>
          <Link to="/aboutus" className="navbar-link">
            <InfoIcon fontSize="small" style={{ marginRight: "5px" }} />
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
