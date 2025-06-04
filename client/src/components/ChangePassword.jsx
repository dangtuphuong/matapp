import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { changeOwnPassword } from "../services/user-service";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword) {
      setError("Both fields are required");
      return;
    }

    if (!passwordPattern.test(newPassword)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol."
      );
      return;
    }

    setLoading(true);
    try {
      await changeOwnPassword({ oldPassword, newPassword });
      setSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ maxWidth: "640px", marginBottom: "40px" }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Password
      </Typography>

      <TextField
        label="Old Password"
        type={showOldPassword ? "text" : "password"}
        fullWidth
        margin="normal"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowOldPassword((show) => !show)}
                edge="end"
                size="small"
                aria-label="toggle old password visibility"
              >
                {showOldPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="New Password"
        type={showNewPassword ? "text" : "password"}
        fullWidth
        margin="normal"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowNewPassword((show) => !show)}
                edge="end"
                size="small"
                aria-label="toggle new password visibility"
              >
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, mt: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Updating..." : "Change Password"}
        </Button>
      </Box>
    </section>
  );
}
