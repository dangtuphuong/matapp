import NavbarPrivate from "./NavbarPrivate";
import NavbarPublic from "./NavbarPublic";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Button,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import "./styles/Navbar.css";
import "./styles/Home.css";

import img1 from "../img/img.jpg";
import img2 from "../img/img2.jpg";

const HomePage = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username"));

  const [currentImage, setCurrentImage] = useState(img1);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const isLogin = localStorage.getItem("access_token");

  useEffect(() => {
    const isFirstLogin = localStorage.getItem("first_login");
    if (isFirstLogin === "true") {
      setOpenSnackbar(true);
      localStorage.setItem("first_login", "false");
    }

    // initialize the image carousel
    const images = [img1, img2];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % images.length;
      setCurrentImage(images[index]);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {!isLogin ? <NavbarPublic /> : <NavbarPrivate />}

      <Box
        sx={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "30px",
          marginTop: "-1px",
        }}
        className="background-wrapper"
      >
        <Container className="landing-container">
          <Box className="landing-hero">
            <Typography
              variant="h2"
              className="landing-hero-title"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 5,
                fontFamily: "Monospace",
              }}
            >
              Smart Material Selections
            </Typography>
            <Typography
              variant="body1"
              className={`landing-hero-subtitle ${
                isLargeScreen ? "typing-text" : ""
              }`}
              sx={{ color: "#fff" }}
            >
              <span>
                Browse, compare, and select the best materials for your
                engineering needs
              </span>
            </Typography>

            <Button
              variant="contained"
              className="search"
              sx={{
                marginTop: "20px",
                padding: "10px 20px",
                fontWeight: "600",
              }}
              component={Link}
              to="/search"
            >
              <span>Search for Materials</span>
            </Button>
          </Box>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ mt: 6 }}
          >
            <Alert
              onClose={() => setOpenSnackbar(false)}
              severity="success"
              variant="filled"
              sx={{
                width: "100%",
                textAlign: "center",
                "@media (max-width: 360px)": {
                  fontSize: "0.9rem", // Smaller font size on mobile
                  padding: "8px", // Adjust padding for a smaller alert box
                },
              }}
            >
              Welcome, {username}! You are logged in successfully!
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default HomePage;
