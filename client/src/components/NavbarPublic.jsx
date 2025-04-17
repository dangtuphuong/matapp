import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../img/onlylogo.png";
import "./styles/navbar.css";

const NavbarPublic = () => {
  return (
    <AppBar position="static" className="navbar-root" elevation={0}>
      <Toolbar className="navbar-toolbar">
        <Box component={Link} to="/" className="navbar-logo">
          <img src={logo} alt="Logo" />
          <Typography variant="h6" className="navbar-logo-text">
            MatApp
          </Typography>
        </Box>

        <Box className="navbar-right-group">
          <Box className="navbar-nav-links">
            <Button className="navbar-link" component={Link} to="/features">
              Features
            </Button>
            <Button className="navbar-link" component={Link} to="/aboutus">
              About Us
            </Button>
          </Box>
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
