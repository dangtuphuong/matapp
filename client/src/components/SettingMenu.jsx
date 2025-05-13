import React from "react";
import { Typography, Box, IconButton, Menu, MenuItem } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { Link } from "react-router-dom";

const ItemStyle = {
  minWidth: 150,
  color: "white",
  justifyContent: "flex-end",
  textAlign: "right",
  "&:hover": { backgroundColor: "#333" },
};

export default function SettingMenu({ username, isAdmin }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Box
        className="navbar-profile-link"
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "rgb(47, 47, 47)",
          borderRadius: "6px",
        }}
        id="setting-button"
        aria-controls={open ? "setting-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <IconButton color="inherit">
          <AccountCircle />
        </IconButton>
        <Typography
          variant="body1"
          className="navbar-username"
          sx={{
            display: { xs: "none", sm: "block" },
            whiteSpace: "nowrap",
            marginRight: "20px",
            cursor: "pointer",
          }}
        >
          {username}
        </Typography>
      </Box>
      <Menu
        id="setting-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          mt: 1,
          "& .MuiPaper-root": {
            backgroundColor: "#2c2c2c",
            color: "white",
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem sx={ItemStyle} component={Link} to="/profile">
          Edit Profile
        </MenuItem>
        {isAdmin && (
          <MenuItem sx={ItemStyle} component={Link} to="/edit-users">
            Manage Users
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}
