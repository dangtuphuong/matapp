import React, { useEffect, useState } from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

import m1 from "../img/materials/m1.png";
import m2 from "../img/materials/m2.png";
import m3 from "../img/materials/m3.png";
import m4 from "../img/materials/m4.png";
import img1 from "../img/img.jpg";
import img2 from "../img/img2.jpg";

import "./styles/Landing.css";
import NavbarPublic from "./NavbarPublic";

const LoadingPage = () => {
  const [currentImage, setCurrentImage] = useState(img1);

  useEffect(() => {
    const images = [img1, img2];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % images.length;
      setCurrentImage(images[index]);
    }, 10000); // Change image every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <NavbarPublic />

      <Box
        sx={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "20px",
          margin: "30px",
          padding: "30px",
          height: "47%",
        }}
        className="background-wrapper"
      >
        <Container className="landing-container">
          <Box className="landing-hero">
            <Typography variant="h2" className="landing-hero-title" sx={{ textTransform: 'uppercase', letterSpacing: 5, fontFamily: 'Monospace' }}>
              Smart Material Selection
            </Typography>
            <Typography
              variant="body1"
              className="landing-hero-subtitle typing-text"
              sx={{ color: "#fff" }}
            >
              <span>
                Browse, compare, and select the best materials for your engineering needs
              </span>
            </Typography>

            <Button
              variant="contained"
              className="search"
              sx={{
                backgroundColor: "#023e8a",
                marginTop: "20px",
                padding: "10px 20px",
                fontWeight: "800",
                borderRadius: "20px",
                "&:hover": {
                  backgroundColor: "#0077b6",
                },
              }}
              component={Link}
              to="/login"
            >
              <span>Get Started</span>
            </Button>
          </Box>

          <Box className="how-it-works">
            <Typography className="material-title" sx={{ fontFamily: 'Monospace', letterSpacing: 5, textTransform: 'uppercase' }}>
              <span>Explore Material Categories</span>
            </Typography>

            <Box className="steps-grid">
              {[m1, m2, m3, m4].map((img, index) => {
                const titles = ["Metal", "Plastic", "Fluids", "Composites"];
                const descs = [
                  "Strong, durable materials ideal for structural and load-bearing applications.",
                  "Lightweight and corrosion-resistant, perfect for packaging solutions.",
                  "Used for hydraulic, lubrication, or thermal regulation needs.",
                  "Engineered blends with tailored properties for shelves and panels.",
                ];
                return (
                  <Box key={index} className="step-card">
                    <Box className="step-card-inner">
                      <Box
                        className="step-card-front"
                        style={{ backgroundImage: `url(${img})` }}
                      >
                        <Box className="step-title-overlay">{titles[index]}</Box>
                      </Box>
                      <Box className="step-card-back">
                        <Typography variant="subtitle1" className="step-title-back">
                          {titles[index]}
                        </Typography>
                        <Typography variant="body2" className="step-desc">
                          {descs[index]}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/*<Box className="about-project">
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
          </Box>*/}
        </Container>
      </Box>
    </>
  );
};

export default LoadingPage;
