import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the local storage token
    localStorage.removeItem("access_token");

    // Redirect to the login page
    navigate("/login");
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        MatApp Home Page
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3 }}>
        You are logged in successfully!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogout}
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default HomePage;
