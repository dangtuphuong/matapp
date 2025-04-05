import React from "react";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <Container>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          padding: "80px 120px",
          borderRadius: 2,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ marginBottom: 3 }}>
          Welcome to MatApp!
        </Typography>

        <Box sx={{ marginTop: 2 }}>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            color="primary"
            sx={{ marginBottom: 2, width: "100%" }}
          >
            Login
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            color="primary"
            sx={{ width: "100%" }}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LandingPage;
