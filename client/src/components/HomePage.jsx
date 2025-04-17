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

const HomePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  // Fetch user info on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Redirect to login if token is missing
    if (!token) {
      navigate("/login");
      return;
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

      {/* Home Page Content */}
      <Container className="home-container">
        <Typography variant="h4" className="home-title">
          MatApp Home Page
        </Typography>
        <Typography variant="body1" className="home-message">
          You are logged in successfully!
        </Typography>
      </Container>
    </>
  );
};

export default HomePage;
