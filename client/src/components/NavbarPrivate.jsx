import React, { useEffect, useState } from "react";
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
import { AccountCircle } from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../img/onlylogo.png";
import { getUserProfile } from "../services/user-service";
import "./styles/Navbar.css";

// Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import BarChart from "@mui/icons-material/BarChart";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const Navbar = ({ onSetUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1160px)");

  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [userRole, setUserRole] = useState(
    localStorage.getItem("user_role") || ""
  );

  const rawNavItems = [
    { label: "Home", path: "/home", icon: <HomeOutlinedIcon /> },
    { label: "Search", path: "/search", icon: <SearchIcon /> },
    {
      label: "Smart Search",
      path: "/smart-search",
      icon: <TroubleshootIcon />,
    },
    { label: "Compare", path: "/compare", icon: <BarChart /> },
    {
      label: "Upload",
      path: "/upload",
      icon: <FileUploadOutlinedIcon />,
      adminOnly: true,
    },
    { label: "About Us", path: "/aboutus", icon: <InfoOutlinedIcon /> },
  ];

  const navItems = rawNavItems.filter(
    (item) => !(item.adminOnly && userRole !== "admin")
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    getUserProfile(token)
      .then((data) => {
        setUsername(data.firstName);
        localStorage.setItem("username", data.firstName);
        if (onSetUser) {
          onSetUser(data || null);
        }
      })
      .catch(() => {
        setUsername("User");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("first_login");
    navigate("/login");
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#1a1a1a",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          className="navbar-toolbar"
          sx={{ justifyContent: "space-between" }}
        >
          {/* Logo */}
          <Box
            component={Link}
            to="/home"
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

          {/* Desktop Nav Links */}
          {!isMobile && (
            <Box
              className="navbar-center-links"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 0,
                flexGrow: 1,
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              {navItems.map(({ label, path, icon }) => (
                <Link
                  key={label}
                  to={path}
                  className="navbar-link"
                  style={{
                    padding: "11px 20px 11px 16px",
                    borderRadius: "6px",
                    backgroundColor:
                      location?.pathname === path ? "#2F2F2F" : "transparent",
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

          {/* Right section */}
          <Box
            className="navbar-right-group"
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              gap: 1,
              marginLeft: "auto",
            }}
          >
            <Box
              component={Link}
              to="/profile"
              className="navbar-profile-link"
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgb(47, 47, 47)",
                borderRadius: "6px",
              }}
            >
              <IconButton color="inherit">
                <AccountCircle />
              </IconButton>
              <Typography
                variant="body1"
                className="navbar-username"
                sx={{
                  display: { xs: "none", sm: "block" },
                  whiteSpace: "nowrap",
                  marginRight: "20px",
                }}
              >
                {username}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              onClick={handleLogout}
              className="navbar-button"
              sx={{
                display: { xs: "none", md: "inline-flex" },
                whiteSpace: "nowrap",
              }}
            >
              Logout
            </Button>

            {/* Mobile: Hamburger menu */}
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

            {/* Divider and Logout Button in Drawer */}
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
