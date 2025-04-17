import React from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
} from "@mui/material";
import { Link } from "react-router-dom";
import logo from "../img/onlylogo.png";
import m1 from "../img/materials/m1.png";
import m2 from "../img/materials/m2.png";
import m3 from "../img/materials/m3.png";
import m4 from "../img/materials/m4.png";
import "./styles/Landing.css";
import NavbarPublic from "./NavbarPublic";

const LandingPage = () => {
  return (
    <>
      <NavbarPublic />

      <Container className="landing-container">
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

          <Button variant="contained" className="search-button">
            Search for Materials
          </Button>
        </Box>

        <Box className="how-it-works">
          <Typography variant="h5" className="section-title">
            How It Works
          </Typography>
          <Box className="steps-grid">
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

        <Box className="about-project">
          <Typography variant="h6" className="section-title">
            About the Project
          </Typography>
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
      </Container>
    </>
  );
};

export default LandingPage;
