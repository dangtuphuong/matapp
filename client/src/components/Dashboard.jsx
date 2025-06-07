import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Delete, BookmarkAdded } from "@mui/icons-material";
import NavbarPrivate from "./NavbarPrivate";
import { toggleBookmark, getUserBookmarks } from "../services/user-service";

const Dashboard = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const isFirstLogin = localStorage.getItem("first_login");
    if (isFirstLogin === "true") {
      setOpenSnackbar(true);
      localStorage.setItem("first_login", "false");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    getUserBookmarks(token)
      .then(setBookmarks)
      .finally(() => setLoading(false));
  }, [token]);

  const handleDeleteBookmark = async (matGUID) => {
    try {
      toggleBookmark(matGUID).then((data) => {
        if (!data?.is_bookmarked) {
          setBookmarks((prev) => prev.filter((b) => b.matGUID !== matGUID));
        }
      });
    } catch (error) {
      console.error("Failed to delete bookmark", error);
    }
  };

  return (
    <>
      <NavbarPrivate />

      <Box>
        <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
          Dashboard
        </Typography>
        <Container>
          <section>
            <Typography variant="h5" sx={{ mb: "10px" }}>
              Saved Favorites
            </Typography>

            <List>
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark, index) => (
                  <ListItem
                    key={index}
                    divider
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteBookmark(bookmark?.matGUID)}
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <BookmarkAdded />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Link
                          href={`/material/${bookmark.matGUID}`}
                          underline="hover"
                          sx={{ color: "black" }}
                          className="bookmark-title"
                        >
                          {bookmark?.["Material Name"]}
                        </Link>
                      }
                      secondary={bookmark?.["Categories"]?.join(", ")}
                    />
                    <span className="bookmark-date">
                      Saved on{" "}
                      {bookmark.saved_at
                        ? new Date(bookmark.saved_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </ListItem>
                ))
              ) : (
                <ListItem
                  sx={{
                    justifyContent: "center",
                    color: "#666",
                    border: "1px dashed #ccc",
                    borderRadius: "8px",
                    padding: 3,
                  }}
                >
                  No bookmarks found.
                </ListItem>
              )}
            </List>
          </section>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{ mt: 6 }}
          >
            <Alert
              onClose={() => setOpenSnackbar(false)}
              severity="success"
              variant="filled"
              sx={{
                width: "100%",
                textAlign: "center",
                "@media (max-width: 360px)": {
                  fontSize: "0.9rem", // Smaller font size on mobile
                  padding: "8px", // Adjust padding for a smaller alert box
                },
              }}
            >
              Welcome, {username}! You are logged in successfully!
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default Dashboard;
