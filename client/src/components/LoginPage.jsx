// LoginPage.jsx
import React, { useState } from "react";
import NavbarPublic from "./NavbarPublic";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/user-service";
import "./styles/Login.css";
import img from "../img/steels.jpg";
import logo from "../img/logo.png";
import onlylogo from "../img/onlylogo.png";
import "./styles/Navbar.css";
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // Form state variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ email, password });

      // Log the full response to verify the role
      console.log(response.data); // Check if role is present in response.data

      // Store tokens and user info in localStorage
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("username", response.data.firstName);

      // Store the user role
      localStorage.setItem("user_role", response.data.role); // Store the user's role

      // Set the first_login flag if it’s not already set
      if (!localStorage.getItem("first_login")) {
        localStorage.setItem("first_login", "true");
      }

      setLoading(false);
      setOpenSnackbar(true);
      navigate("/home");
    } catch (error) {
      setLoading(false);

      // Show error messages
      if (error.response && error.response.status === 401) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred, please try again later.");
      }
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      {/* Public navbar at the top */}
      <NavbarPublic />

      {/* Main login page layout */}
      <div className="login-page">
        {/* Left side with image */}
        <div className="login-left">
          <img src={img} alt="login-illustration" />
        </div>

        {/* Right side with login form */}
        <div className="login-right">
          <Paper elevation={0} className="paper-container">
            {/* Logo and header */}
            <div className="login-header">
              <img src={logo} alt="logo" className="login-logo" />
              <Typography variant="h4" className="login-title">
                Welcome Back!
              </Typography>
            </div>

            <Typography variant="body2" className="login-subtitle">
              Please enter your details
            </Typography>

            {/* Login form */}
            <form onSubmit={handleLogin} className="login-form">
              {/* Email input */}
              <TextField
                placeholder="Email"
                variant="outlined"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="login-textfield"
              />

              {/* Password input with toggle visibility */}
              <TextField
                placeholder="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-textfield"
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Login button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="login-button"
              >
                {loading ? <CircularProgress size={24} /> : "Log in"}
              </Button>

              {/* Register button */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/register")}
                className="register-button"
              >
                Create new account
              </Button>
            </form>
          </Paper>
        </div>

        {/* Snackbar to show error messages */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={errorMessage}
        />
      </div>
    </>
  );
};

export default Login;
