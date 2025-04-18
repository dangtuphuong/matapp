import React, { useEffect, useState } from "react";
import NavbarPrivate from "./NavbarPrivate";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Avatar,
} from "@mui/material";
import { AccountCircle, Download, Group } from "@mui/icons-material";
import { getUserProfile } from "../services/user-service";
import { useNavigate } from "react-router-dom";
import "./styles/Profile.css";
import { ROLES, ROLE_LABELS } from "../constants";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    // Redirect to login if token is missing
    if (!token) {
      navigate("/login");
      return;
    }

    // Get profile from API
    getUserProfile(token)
      .then((data) => setProfile(data))
      .catch((err) => {
        console.error("Profile fetch failed", err);
        navigate("/login");
      });
  }, [navigate]);

  // Conditionally render role-based action buttons
  const renderRoleButtons = (role) => {
    switch (role) {
      case ROLES.NORMAL_USER: // Role 1
        return (
          <Button
            variant="contained"
            color="secondary"
            className="go-premium-button"
            size="large"
          >
            Go Premium
          </Button>
        );
      case ROLES.PREMIUM_USER: // Role 2
        return (
          <Button variant="outlined" startIcon={<Download />}>
            Export Data
          </Button>
        );
      case ROLES.ADMIN: // Role 0
        return (
          <>
            <Button
              variant="outlined"
              startIcon={<Group />}
              onClick={() => navigate("/edit-users")}
            >
              Edit Users
            </Button>
            <Button variant="outlined" startIcon={<Download />}>
              Export Data
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Private navbar with user’s first name */}
      <NavbarPrivate username={profile?.firstName || "User"} />

      <Container className="profile-container">
        {/* Profile summary card */}
        <Paper elevation={2} className="profile-card">
          <Avatar className="profile-avatar">
            <AccountCircle sx={{ fontSize: 80 }} />
          </Avatar>

          <Typography variant="h6" className="profile-name">
            {profile?.firstName || "John Smith"}
          </Typography>

          {/* Display profile details */}
          <Box className="profile-info-box">
            <Typography variant="body1">
              <strong>Full Name:</strong> {profile?.firstName}{" "}
              {profile?.lastName}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {profile?.email}
            </Typography>
            <Typography variant="body1">
              <strong>Gender:</strong> {profile?.gender}
            </Typography>
            <Typography variant="body1">
              <strong>Date of Birth:</strong> {profile?.dateOfBirth}
            </Typography>
            <Typography variant="body1">
              <strong>Role:</strong> {ROLE_LABELS[profile?.role] || "Unknown"}
            </Typography>
          </Box>

          {/* Display action buttons based on role */}
          <Box className="profile-buttons">
            {renderRoleButtons(profile?.role)}
          </Box>
        </Paper>

        {/* Section for user-specific stats (can be expanded) */}
        <Box className="profile-stats-section">
          <Typography variant="h6" className="profile-stats-title">
            My Stats
          </Typography>
          <Box className="profile-stats-grid">
            <Paper className="stat-card">Stat 01</Paper>
            <Paper className="stat-card">Stat 02</Paper>
            <Paper className="stat-card">Stat 03</Paper>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default ProfilePage;
