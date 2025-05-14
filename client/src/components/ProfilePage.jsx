// import React and other necessary libraries
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Avatar,
  TextField,
  IconButton,
} from "@mui/material";
import {
  AccountCircle,
  Download,
  Group,
  OpenInNew,
  Delete,
} from "@mui/icons-material";
import { getUserProfile } from "../services/user-service";
import { useNavigate } from "react-router-dom";
import NavbarPrivate from "./NavbarPrivate";
import { ROLES, ROLE_LABELS } from "../constants";
import "./styles/Profile.css";
import axios from "axios";

// Function to fetch user profile and bookmarks
const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();

  // Fetch user profile + bookmarks on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    getUserProfile(token)
      .then((data) => {
        setProfile(data);
        setName(`${data.firstName} ${data.lastName}`);
        setEmail(data.email);

        // Fetch bookmarks
        axios
          .get("/api/bookmarks", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setBookmarks(res.data))
          .catch((err) => console.error("Bookmark fetch failed", err));
      })
      .catch((err) => {
        console.error("Profile fetch failed", err);
        navigate("/login");
      });
  }, [navigate]);

  // Function to handle profile save
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

  // Function to render role-specific buttons
  const renderRoleButtons = (role) => {
    if (role === ROLES.ADMIN) {
      return (
        <Button
          variant="outlined"
          startIcon={<Group />}
          onClick={() => navigate("/edit-users")}
        >
          Edit Users
        </Button>
      );
    }

    // Premium users: no buttons
    return null;
  };

  // Function to handle bookmark deletion
  const handleDeleteBookmark = async (matGUID) => {
    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`/api/bookmarks/${matGUID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookmarks((prev) => prev.filter((b) => b.matGUID !== matGUID));
    } catch (error) {
      console.error("Failed to delete bookmark", error);
    }
  };


  return (
    <>
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
                InputProps={{ readOnly: !isEditing }}
              />
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{ readOnly: !isEditing }}
              />
              <TextField
                fullWidth
                label="Date of Birth"
                margin="normal"
                defaultValue={profile?.dateOfBirth}
                key={profile?.dateOfBirth}
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Gender"
                margin="normal"
                defaultValue={profile?.gender}
                key={profile?.gender}
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Role"
                margin="normal"
                defaultValue={ROLE_LABELS[profile?.role] || "Unknown"}
                key={profile?.role}
                InputProps={{ readOnly: true }}
              />

              <div className="profile-buttons">
                {renderRoleButtons(profile?.role)}
                {!isEditing ? (
                  <Button variant="contained" onClick={() => setIsEditing(true)}>
                    Update Profile
                  </Button>
                ) : (
                  <>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button variant="contained" onClick={handleSave}>
                        Save
                      </Button>
                    </Box>
                  </>
                )}
              </div>
            </form>
          </section>

          {/* Bookmarks Section */}
          <section className="bookmarks-section">
            <h3 className="section-title">Bookmarks</h3>
            <div className="bookmarks-list">
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark, index) => (
                  <div key={index} className="bookmark-item">
                    <span className="bookmark-title">
                      {`${index + 1}. ${bookmark["Material Name"]}`}
                    </span>
                    <div className="bookmark-actions">
                      <span className="bookmark-date">
                        Saved on {bookmark.saved_at ? new Date(bookmark.saved_at).toLocaleDateString() : "N/A"}
                      </span>
                      <IconButton onClick={() => navigate(`/material/${bookmark.matGUID}`)}>
                        <OpenInNew fontSize="small" />
                      </IconButton>
                       <IconButton onClick={() => handleDeleteBookmark(bookmark.matGUID)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#777" }}>
                  No bookmarks found.
                </Typography>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;