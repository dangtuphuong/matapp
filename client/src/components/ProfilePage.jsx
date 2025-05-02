import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Avatar,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  AccountCircle,
  Download,
  Group,
  OpenInNew,
} from "@mui/icons-material";
import { getUserProfile } from "../services/user-service";
import { useNavigate } from "react-router-dom";
import NavbarPrivate from "./NavbarPrivate";
import { ROLES, ROLE_LABELS } from "../constants";
import "./styles/Profile.css";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    getUserProfile(token)
      .then((data) => {
        setProfile(data);
        setName(`${data.firstName} ${data.lastName}`);
        setEmail(data.email);
      })
      .catch((err) => {
        console.error("Profile fetch failed", err);
        navigate("/login");
      });
  }, [navigate]);

  // Dummy bookmarks for demonstration
  const dummyBookmarks = [
    { title: "Material 1", date: "05/04/2023" },
    { title: "Material 2", date: "05/04/2023" },
    { title: "Material 3", date: "05/04/2023" },
    { title: "Material 4", date: "05/04/2023" },
  ];

  // Save updated name/email to backend
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const [firstName, ...lastNameParts] = name.trim().split(" ");
      const lastName = lastNameParts.join(" ") || "";
      await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      // Update UI
      setProfile((prev) => ({
        ...prev,
        firstName,
        lastName,
        email,
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  // Conditionally render role-based action buttons
  const renderRoleButtons = (role) => {
    switch (role) {
      case ROLES.NORMAL_USER:
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
      case ROLES.PREMIUM_USER:
        return (
          <Button variant="outlined" startIcon={<Download />}>
            Export Data
          </Button>
        );
      case ROLES.ADMIN:
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
      {/* Top Navbar */}
      <NavbarPrivate />

      <main className="profile-main">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-avatar-wrapper">
            <Avatar className="profile-avatar">
              <AccountCircle sx={{ fontSize: 80 }} />
            </Avatar>
          </div>
          <h2 className="sidebar-name">{profile?.firstName || "Test User"}</h2>
          <p className="sidebar-email">{profile?.email || "user@example.com"}</p>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Profile Section */}
          <section className="profile-section">
            <h3 className="section-title">Profile</h3>
            <form className="profile-form">
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  readOnly: !isEditing,
                }}
              />
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  readOnly: !isEditing,
                }}
              />
              <TextField
                fullWidth
                label="Date of Birth"
                margin="normal"
                defaultValue={profile?.dateOfBirth}
                key={profile?.dateOfBirth}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Gender"
                margin="normal"
                defaultValue={profile?.gender}
                key={profile?.gender}
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Role"
                margin="normal"
                defaultValue={ROLE_LABELS[profile?.role] || "Unknown"}
                key={profile?.role}
                InputProps={{
                  readOnly: true,
                }}
              />

              <div className="profile-buttons">
                {!isEditing ? (
                  <Button variant="contained" onClick={() => setIsEditing(true)}>
                    Update Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" onClick={handleSave}>
                      Save
                    </Button>
                    <Button variant="outlined" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                )}
                {renderRoleButtons(profile?.role)}
              </div>
            </form>
          </section>

          {/* Bookmarks Section */}
          <section className="bookmarks-section">
            <h3 className="section-title">Bookmarks</h3>
            <div className="bookmarks-list">
              {dummyBookmarks.map((bookmark, index) => (
                <div key={index} className="bookmark-item">
                  <span className="bookmark-title">{bookmark.title}</span>
                  <div className="bookmark-actions">
                    <span className="bookmark-date">Saved on {bookmark.date}</span>
                    <div className="bookmark-buttons">
                      <IconButton>
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
