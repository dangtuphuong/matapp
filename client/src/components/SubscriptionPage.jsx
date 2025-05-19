import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

const teamMembers = [];

const SubscriptionModal = ({ open, handleClose }) => {
  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Contact Our Team</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph align="center">
          Please contact website admin for more info.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SubscriptionPage = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpenModal}>
        Subscribe Now
      </Button>

      <SubscriptionModal open={openModal} handleClose={handleCloseModal} />
    </div>
  );
};

export default SubscriptionPage;
