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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await getUserProfile(token);
        setUsername(data.firstName || "User");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <>
      <NavbarPrivate username={username} />

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
