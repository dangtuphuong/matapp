import NavbarPrivate from "./NavbarPrivate";
import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./styles/navbar.css";
import "./styles/Landing.css";

import img1 from "../img/img.jpg";
import img2 from "../img/img2.jpg";
import m1 from "../img/materials/m1.png";
import m2 from "../img/materials/m2.png";
import m3 from "../img/materials/m3.png";
import m4 from "../img/materials/m4.png";

const HomePage = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "User"
  );
  const [currentImage, setCurrentImage] = useState(img1);

  useEffect(() => {
    const isFirstLogin = localStorage.getItem("first_login");
    if (isFirstLogin === "true") {
      setOpenSnackbar(true);
      localStorage.setItem("first_login", "false");
    }

    const images = [img1, img2];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % images.length;
      setCurrentImage(images[index]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <NavbarPrivate />
      <Box
        className="background-wrapper"
        style={{ backgroundImage: `url(${currentImage})` }}
      >
        <Container className="landing-container">
          <Box className="landing-hero">
            <Typography variant="h2" className="landing-hero-title">
              Smart Material Selection
            </Typography>
            <Typography
              variant="body1"
              className="landing-hero-subtitle typing-text"
            >
              <span>
                Browse, compare, and select the best materials for your
                engineering needs
              </span>
            </Typography>

            <Button
              variant="contained"
              className="search-button"
              component={Link}
              to="/search"
            >
              <span>Search for Materials</span>
            </Button>
          </Box>

          <Box className="how-it-works">
            <Typography className="material-title">
              <span>Explore Material Categories</span>
            </Typography>

            <Box className="steps-grid">
              {[
                {
                  img: m1,
                  title: "Metal",
                  desc: "Strong, durable materials ideal for structural and load-bearing applications.",
                },
                {
                  img: m2,
                  title: "Plastic",
                  desc: "Lightweight and corrosion-resistant, perfect for packaging solutions.",
                },
                {
                  img: m3,
                  title: "Fluids",
                  desc: "Used for hydraulic, lubrication, or thermal regulation needs.",
                },
                {
                  img: m4,
                  title: "Composites",
                  desc: "Engineered blends with tailored properties for shelves and panels.",
                },
              ].map((item, idx) => (
                <Box key={idx} className="step-card">
                  <Box className="step-card-inner">
                    <Box
                      className="step-card-front"
                      style={{ backgroundImage: `url(${item.img})` }}
                    >
                      <Box className="step-title-overlay">{item.title}</Box>
                    </Box>
                    <Box className="step-card-back">
                      <Typography
                        variant="subtitle1"
                        className="step-title-back"
                      >
                        <span>{item.title}</span>
                      </Typography>
                      <Typography variant="body2" className="step-desc">
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={4000}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={() => setOpenSnackbar(false)}
              severity="success"
              className="welcome-alert"
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
