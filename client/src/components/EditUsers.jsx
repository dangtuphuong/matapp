import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, LockReset } from "@mui/icons-material";
import {
  getAllUsers,
  updateUserInfo,
  deleteUser,
  resetUserPassword,
} from "../services/user-service";
import NavbarPrivate from "./NavbarPrivate";
import "./styles/EditUsers.css";

// Role mappings
const roleMap = {
  0: "Admin",
  1: "Normal User",
  2: "Premium User",
};

const EditUsers = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const currentEmail = localStorage.getItem("username");

  // Fetch all users from backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open edit dialog with selected user
  const handleEditClick = (user) => {
    setEditUser(user);
    setEditDialogOpen(true);
  };

  // Save updated user info
  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await updateUserInfo(token, editUser.email, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        dateOfBirth: editUser.dateOfBirth,
        gender: editUser.gender,
        email: editUser.email,
      });
      setEditDialogOpen(false);
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // Reset user password
  const handleResetPassword = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await resetUserPassword(token, editUser.email, newPassword);
      setResetPasswordDialogOpen(false);
      setNewPassword("");
    } catch (err) {
      console.error("Reset failed", err);
    }
  };

  // Delete user after confirmation
  const handleDelete = async (user) => {
    if (user.email === currentEmail) {
      alert("You cannot delete your own account.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${user.email}?`)) {
      try {
        const token = localStorage.getItem("access_token");
        await deleteUser(token, user._id);
        fetchUsers(); // Refresh list
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <>
      {/* Navbar with logged-in admin's name */}
      <NavbarPrivate />
      <Container>
        <Typography className="edit-users-title">Manage Users</Typography>

        {/* Users Table */}
        <Table className="user-table">
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>DOB</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>{user.dateOfBirth}</TableCell>
                <TableCell>{roleMap[user.role] || "Unknown"}</TableCell>
                <TableCell align="right">
                  {/* Edit Button */}
                  <IconButton onClick={() => handleEditClick(user)}>
                    <Edit />
                  </IconButton>
                  {/* Reset Password Button */}
                  <Tooltip title="Reset Password">
                    <IconButton
                      onClick={() => {
                        setEditUser(user);
                        setResetPasswordDialogOpen(true);
                      }}
                    >
                      <LockReset />
                    </IconButton>
                  </Tooltip>
                  {/* Delete Button */}
                  <IconButton onClick={() => handleDelete(user)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="First Name"
              value={editUser?.firstName || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, firstName: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Last Name"
              value={editUser?.lastName || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, lastName: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Email"
              value={editUser?.email || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={editUser?.dateOfBirth || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, dateOfBirth: e.target.value })
              }
              margin="dense"
            />
            <TextField
              fullWidth
              label="Gender"
              value={editUser?.gender || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, gender: e.target.value })
              }
              margin="dense"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog
          open={resetPasswordDialogOpen}
          onClose={() => setResetPasswordDialogOpen(false)}
        >
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="dense"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} variant="contained">
              Reset
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default EditUsers;
