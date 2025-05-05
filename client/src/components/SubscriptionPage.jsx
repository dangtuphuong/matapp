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

const teamMembers = [
  {
    name: "Aditya Roy",
    id: "104671426",
    email: "104671426@student.swin.edu.au",
  },
  {
    name: "Lalitha Samudith",
    id: "104760748",
    email: "104760748@student.swin.edu.au",
  },
  {
    name: "Vu Hoang Nam Dao",
    id: "104474191",
    email: "104474191@student.swin.edu.au",
  },
  {
    name: "Pattarapol Laovanich",
    id: "104338734",
    email: "104338734@student.swin.edu.au",
  },
  {
    name: "Riya Shrestha",
    id: "104652997",
    email: "104652997@student.swin.edu.au",
  },
  {
    name: "Tu Phuong Dang",
    id: "103814482",
    email: "103814482@student.swin.edu.au",
  },
];

const SubscriptionModal = ({ open, handleClose }) => {
  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Contact Our Team</DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          For subscription inquiries, please contact one of our team members
          below:
        </Typography>
        <List>
          {teamMembers.map((member, index) => (
            <ListItem key={index}>
              <ListItemText primary={member.name} />
              <IconButton onClick={() => handleEmailClick(member.email)}>
                <EmailIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
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
