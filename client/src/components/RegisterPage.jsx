import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { ROLES } from "../constants";
import { registerUser } from "../services/user-service";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.NORMAL_USER);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleRoleChange = (event) => {
    setRole(event.target.name);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await registerUser({ email, password, role });

      // Save token to local storage
      localStorage.setItem("access_token", response.data.access_token);

      setLoading(false);
      setOpenSnackbar(true);

      navigate("/home");
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred, please try again later.");
      }
      setOpenSnackbar(true);
    }
  };

  return (
    <Container className="register-container">
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Register
      </Typography>
      <form onSubmit={handleRegister}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 1 }}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 1 }}
        />
        <Box sx={{ marginBottom: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={role === ROLES.NORMAL_USER}
                onChange={handleRoleChange}
                name={ROLES.NORMAL_USER}
                color="primary"
              />
            }
            label="Normal User"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={role === ROLES.PREMIUM_USER}
                onChange={handleRoleChange}
                name={ROLES.PREMIUM_USER}
                color="primary"
              />
            }
            label="Premium User"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={role === ROLES.ADMIN}
                onChange={handleRoleChange}
                name={ROLES.ADMIN}
                color="primary"
              />
            }
            label="Admin"
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Register"}
        </Button>
      </form>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/login")}
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        Login
      </Button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        message={errorMessage}
      />
    </Container>
  );
};

export default Register;
