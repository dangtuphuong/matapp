import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../img/onlylogo.png";
import "./styles/navbar.css";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const NavbarPublic = () => {
  return (
    <AppBar position="static" className="navbar-root" elevation={0}>
      <Toolbar className="navbar-toolbar">
        {/* Left section: logo and title */}
        <Box component={Link} to="/" className="navbar-logo">
          <img src={logo} alt="Logo" />
          <Typography variant="h6" className="navbar-logo-text">
            MatApp
          </Typography>
        </Box>

        {/* Right section: navigation links and login button */}
        <Box className="navbar-right-group">
          <Box className="navbar-nav-links">
            <Button
              className="navbar-link"
              component={Link}
              to="/"
              startIcon={<HomeOutlinedIcon />}
            >
              Home
            </Button>
            <Button
              className="navbar-link"
              component={Link}
              to="/aboutus"
              startIcon={<InfoOutlinedIcon />}
            >
              About Us
            </Button>
          </Box>

          {/* Login button */}
          <Button
            component={Link}
            to="/login"
            className="navbar-button"
            variant="outlined"
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarPublic;
