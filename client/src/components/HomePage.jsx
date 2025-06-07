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
} from "@mui/material";

import { Link } from "react-router-dom";

const HomePage = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username"));

  const isLogin = localStorage.getItem("access_token");

  useEffect(() => {
    const isFirstLogin = localStorage.getItem("first_login");
    if (isFirstLogin === "true") {
      setOpenSnackbar(true);
      localStorage.setItem("first_login", "false");
    }
  }, []);

  return (
    <>
      {!isLogin ? <NavbarPublic /> : <NavbarPrivate />}

      <Box className="background-wrapper">
        <Container className="landing-container">
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
