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
import "./styles/login.css";
import logo from "../img/logo.png";
import onlylogo from "../img/onlylogo.png";
import "./styles/navbar.css"; // <-- Adjust the path if needed
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("username", response.data.firstName);
      setLoading(false);
      setOpenSnackbar(true);
      navigate("/home");
    } catch (error) {
      setLoading(false);
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
      <NavbarPublic />

      <div className="login-page">
        <div className="login-left">
          <img src="/src/img/steels.jpg" alt="login-illustration" />
        </div>

        <div className="login-right">
          <Paper elevation={0} className="paper-container">
            <div className="login-header">
              <img src={logo} alt="logo" className="login-logo" />
              <Typography variant="h4" className="login-title">
                Welcome Back!
              </Typography>
            </div>
            <Typography variant="body2" className="login-subtitle">
              Please enter your details
            </Typography>

            <form onSubmit={handleLogin} className="login-form">
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

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="login-button"
              >
                {loading ? <CircularProgress size={24} /> : "Log in"}
              </Button>

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
