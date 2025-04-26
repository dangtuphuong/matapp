import { getUserProfile } from "../services/user-service";
import NavbarPrivate from "./NavbarPrivate";
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Box,
  IconButton,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import logo from "../img/onlylogo.png";
import "./styles/navbar.css";
import "./styles/Home.css";
import m1 from "../img/materials/m1.png";
import m2 from "../img/materials/m2.png";
import m3 from "../img/materials/m3.png";
import m4 from "../img/materials/m4.png";
import "./styles/Landing.css";
import { Snackbar, Alert } from "@mui/material";

const HomePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch user info on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Redirect to login if token is missing
    if (!token) {
      navigate("/login");
      return;
    }

    // Check if it's the first login
    const isFirstLogin = localStorage.getItem("first_login");

    // If it's the first login, show the snackbar
    if (isFirstLogin === "true") {
      setOpenSnackbar(true);
      // After showing the snackbar, set the flag to false so it won't show again
      localStorage.setItem("first_login", "false");
    }

    // Get user's profile data
    const fetchUser = async () => {
      try {
        const data = await getUserProfile(token);
        setUsername(data.firstName || "User"); // Display first name
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        navigate("/login"); // Redirect on failure
      }
    };

    fetchUser();
  }, [navigate]);

  // Clear token and redirect to login
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <>
      {/* Private Navbar with username */}
      <NavbarPrivate username={username} />

      {/* Main content container */}
      <Container className="landing-container">
        {/* Hero section */}
        <Box className="landing-hero">
          <Typography variant="h3" className="landing-hero-title">
            Smart Material
            <br />
            Selection, Simplified
          </Typography>
          <Typography
            variant="body1"
            className="landing-hero-subtitle typing-text"
          >
            Browse, compare, and select the best materials for your engineering
            needs
          </Typography>

          {/* Call to action */}
          <Button variant="contained" className="search-button">
            Search for Materials
          </Button>
        </Box>

        {/* Step-by-step section */}
        <Box className="how-it-works">
          <Typography variant="h5" className="section-title">
            How It Works
          </Typography>

          {/* Flip card grid for material types */}
          <Box className="steps-grid">
            {/* Metal Card */}
            <Box className="step-card">
              <Box className="step-card-inner">
                <Box className="step-card-front">
                  <img src={m1} alt="Metal" className="step-image" />
                  <Typography variant="subtitle1" className="step-title">
                    Metal
                  </Typography>
                </Box>
                <Box className="step-card-back">
                  <Typography variant="body2" className="step-desc">
                    Strong, durable materials ideal for structural and
                    load-bearing applications in warehouses.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Plastic Card */}
            <Box className="step-card">
              <Box className="step-card-inner">
                <Box className="step-card-front">
                  <img src={m2} alt="Plastic" className="step-image" />
                  <Typography variant="subtitle1" className="step-title">
                    Plastic
                  </Typography>
                </Box>
                <Box className="step-card-back">
                  <Typography variant="body2" className="step-desc">
                    Lightweight and corrosion-resistant, perfect for packaging
                    and modular storage solutions.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Fluids Card */}
            <Box className="step-card">
              <Box className="step-card-inner">
                <Box className="step-card-front">
                  <img src={m3} alt="Fluids" className="step-image" />
                  <Typography variant="subtitle1" className="step-title">
                    Fluids
                  </Typography>
                </Box>
                <Box className="step-card-back">
                  <Typography variant="body2" className="step-desc">
                    Managed and stored for hydraulic, lubrication, or thermal
                    regulation needs in warehouses.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Composites Card */}
            <Box className="step-card">
              <Box className="step-card-inner">
                <Box className="step-card-front">
                  <img src={m4} alt="Composites" className="step-image" />
                  <Typography variant="subtitle1" className="step-title">
                    Composites
                  </Typography>
                </Box>
                <Box className="step-card-back">
                  <Typography variant="body2" className="step-desc">
                    Engineered blends offering tailored properties for shelves,
                    panels, and load optimization.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* About the Project Section */}
        <Box className="about-project">
          <Typography variant="h6" className="section-title">
            About the Project
          </Typography>

          {/* Informative points about the project */}
          <Box className="about-points">
            {[
              {
                icon: "🔍",
                title: "Our Mission",
                text: "To simplify the complex process of material selection for engineers and designers.",
              },
              {
                icon: "🧠",
                title: "The Challenge",
                text: "Engineers often sift through outdated datasheets and scattered sources.",
              },
              {
                icon: "💡",
                title: "The Solution",
                text: "MatApp centralizes materials data, offering intuitive tools to search, compare, and filter.",
              },
              {
                icon: "🚀",
                title: "Why It Matters",
                text: "Better material choices lead to smarter, more efficient designs—fast.",
              },
            ].map((point, idx) => (
              <Box key={idx} className="about-point-row">
                <span className="about-icon">{point.icon}</span>
                <Typography variant="body1">
                  <strong>{point.title}:</strong> {point.text}
                </Typography>
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
            sx={{
              width: "100%",
              fontSize: "1.2rem",
              textAlign: "center",
            }}
          >
            Welcome, {username}! You are logged in successfully!
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default HomePage;
