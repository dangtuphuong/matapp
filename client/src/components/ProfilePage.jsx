import React, { useEffect, useState } from "react";
import NavbarPrivate from "./NavbarPrivate";
import {
  Container,
  Typography,
  Box,
  IconButton,
  Button,
  Paper,
  Avatar,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { getUserProfile } from "../services/user-service";
import { useNavigate } from "react-router-dom";
import "./styles/Profile.css";

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

  return (
    <>
      <NavbarPrivate username={profile?.firstName || "User"} />

      <Container className="profile-container">
        {/* Profile Card */}
        <Paper elevation={2} className="profile-card">
          <Avatar className="profile-avatar">
            <AccountCircle sx={{ fontSize: 80 }} />
          </Avatar>
          <Typography variant="h6" className="profile-name">
            {profile?.firstName || "John Smith"}
          </Typography>
          <Typography variant="body2" className="profile-email">
            {profile?.email || "johnsmith@email.com"}
          </Typography>
          <Box className="profile-buttons">
            <Button variant="contained">Edit Profile</Button>
            <Button variant="outlined">Account Settings</Button>
          </Box>
        </Paper>

        {/* Stats Section */}
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
