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
import { ROLES } from "../constants";

const roleLabelMap = {
  0: "Admin",
  1: "Normal User",
  2: "Premium User",
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    getUserProfile(token)
      .then((data) => setProfile(data))
      .catch((err) => {
        console.error("Profile fetch failed", err);
        navigate("/login");
      });
  }, [navigate]);

  const renderRoleButtons = (role) => {
    switch (role) {
      case ROLES.NORMAL_USER: // 1
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
      case ROLES.PREMIUM_USER: // 2
        return (
          <Button variant="outlined" startIcon={<Download />}>
            Export Data
          </Button>
        );
      case ROLES.ADMIN: // 0
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
      <NavbarPrivate username={profile?.firstName || "User"} />

      <Container className="profile-container">
        <Paper elevation={2} className="profile-card">
          <Avatar className="profile-avatar">
            <AccountCircle sx={{ fontSize: 80 }} />
          </Avatar>
          <Typography variant="h6" className="profile-name">
            {profile?.firstName || "John Smith"}
          </Typography>

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
              <strong>Role:</strong> {roleLabelMap[profile?.role] || "Unknown"}
            </Typography>
          </Box>

          <Box className="profile-buttons">
            {renderRoleButtons(profile?.role)}
          </Box>
        </Paper>

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
