import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/user-service";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser({ email, password });

      // Save token to local storage
      localStorage.setItem("access_token", response.data.access_token);

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
    <Container className="login-container">
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Login
      </Typography>
      <form onSubmit={handleLogin}>
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
          sx={{ marginBottom: 3 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Login"}
        </Button>
      </form>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/register")}
        sx={{ position: "absolute", top: 16, right: 16 }}
      >
        Register
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

export default Login;
