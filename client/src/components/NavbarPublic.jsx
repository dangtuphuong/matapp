import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link } from "react-router-dom";
import logo from "../img/onlylogo.png";
import "./styles/navbar.css";

const navItems = [
  { label: "Home", path: "/", icon: <HomeOutlinedIcon /> },
  { label: "About Us", path: "/aboutus", icon: <InfoOutlinedIcon /> },
];

const NavbarPublic = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar position="static" className="navbar-root" elevation={0}>
        <Toolbar className="navbar-toolbar">
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            className="navbar-logo"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              flexShrink: 0,
              minWidth: "auto",
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
                marginRight: 8,
              }}
            />
            <Typography
              variant="h6"
              className="navbar-logo-text"
              sx={{
                display: { xs: "none", md: "block" },
                fontSize: "1.25rem",
                whiteSpace: "nowrap",
                color: "white",
              }}
            >
              MatApp
            </Typography>
          </Box>

          {/* Center Links */}
          {!isMobile && (
            <Box className="navbar-center-links">
              {navItems.map(({ label, path, icon }) => (
                <Link
                  key={label}
                  to={path}
                  className="navbar-link"
                  style={{
                    padding: "11px 20px 11px 16px",
                    borderRadius: "6px",
                  }}
                >
                  {React.cloneElement(icon, {
                    fontSize: "small",
                    style: { marginRight: 5 },
                  })}
                  <span style={{ whiteSpace: "nowrap" }}>{label}</span>
                </Link>
              ))}
            </Box>
          )}

          {/* Right: Login + Mobile Menu */}
          <Box className="navbar-right-group">
            <Button
              component={Link}
              to="/login"
              className="navbar-button"
              variant="outlined"
              sx={{
                display: { xs: "none", md: "inline-flex" },
                whiteSpace: "nowrap",
              }}
            >
              Login
            </Button>

            {/* Hamburger menu for mobile */}
            {isMobile && (
              <IconButton
                onClick={toggleDrawer(true)}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {navItems.map(({ label, path, icon }) => (
              <ListItem button component={Link} to={path} key={label}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItem>
            ))}
            <ListItem button component={Link} to="/login">
              <ListItemIcon>
                <InfoOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NavbarPublic;
