import React, { useState } from "react";
import {
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../constants";
import { registerUser } from "../services/user-service";
import logo from "../img/onlylogo.png";
import NavbarPublic from "./NavbarPublic"; // ✅ using public navbar
import "./styles/Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // ✅ new
  const [role, setRole] = useState(ROLES.NORMAL_USER);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ new

  const handleRoleChange = (e) => {
    e.preventDefault();
    setRole(Number(e?.target?.name));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const currentDate = new Date();
    const birthDate = new Date(dateOfBirth);

    if (birthDate > currentDate) {
      setErrorMessage("Invalid Date of Birth");
      setOpenSnackbar(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setOpenSnackbar(true);
      return;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    if (!passwordPattern.test(password)) {
      setErrorMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol."
      );
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        password,
        role,
      });
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
    <>
      <NavbarPublic />
      <Box className="register-container">
        <Box className="register-logo-section">
          <img src={logo} alt="Logo" className="register-logo-image" />
          <Typography variant="h2" className="register-title">
            Matapp
          </Typography>
        </Box>
        <Box className="register-box">
          <Typography variant="h5">Create a new account</Typography>
          <form onSubmit={handleRegister}>
            <TextField
              label="First Name"
              variant="outlined"
              fullWidth
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="register-form-control"
            />
            <TextField
              label="Last Name"
              variant="outlined"
              fullWidth
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="register-form-control"
            />
            <TextField
              label="Email"
              variant="outlined"
              type="email"
              fullWidth
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-form-control"
            />
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-form-control"
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
            <TextField
              label="Confirm Password"
              variant="outlined"
              fullWidth
              required
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="register-form-control"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Date of Birth"
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="register-form-control"
            />
            <FormControl component="fieldset" className="register-form-control">
              <FormLabel component="legend">Gender</FormLabel>
              <RadioGroup
                row
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Male"
                />
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Female"
                />
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  label="Other"
                />
              </RadioGroup>
            </FormControl>
            <Box className="register-role-box">
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
              className="register-button"
            >
              {loading ? <CircularProgress size={24} /> : "Sign Up"}
            </Button>
          </form>
          <Typography variant="body2">
            Already have an account?{" "}
            <Button
              onClick={() => navigate("/login")}
              className="login-link-button"
            >
              Log In
            </Button>
          </Typography>
        </Box>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={errorMessage}
        />
      </Box>
    </>
  );
};

export default Register;
