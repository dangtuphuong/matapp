import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";

import RuleFolderOutlinedIcon from "@mui/icons-material/RuleFolderOutlined";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";

const UploadInstructions = () => (
  <Paper
    elevation={0}
    variant="outlined"
    sx={{ p: 2, mb: 3, mt: 3, backgroundColor: "#f9f9f9" }}
  >
    <Typography variant="h6" gutterBottom>
      How to Use:
    </Typography>
    <List dense>
      <ListItem>
        <ListItemIcon sx={{ minWidth: "40px" }}>
          <RuleFolderOutlinedIcon />
        </ListItemIcon>
        <ListItemText
          primary="Format Check"
          secondary={
            <>
              Ensure your files are valid JSON (<code>.json</code>) and contain
              the necessary fields, including a non-empty{" "}
              <strong>"Material Name"</strong>. Download the{" "}
              <strong>"Example JSON"</strong> to check the required structure.
            </>
          }
        />
      </ListItem>
      <ListItem>
        <ListItemIcon sx={{ minWidth: "40px" }}>
          <TouchAppOutlinedIcon />
        </ListItemIcon>
        <ListItemText
          primary="Select Files"
          secondary="Click 'Select JSON Files' and choose one or more files from your computer. You can select multiple files using Shift-click or Ctrl/Cmd-click."
        />
      </ListItem>
      <ListItem>
        <ListItemIcon sx={{ minWidth: "40px" }}>
          <CloudUploadOutlinedIcon />
        </ListItemIcon>
        <ListItemText
          primary="Upload Files"
          secondary="Review your selected files listed below the button, then click 'Upload [N] file(s)'."
        />
      </ListItem>
      <ListItem>
        <ListItemIcon sx={{ minWidth: "40px" }}>
          <ListAltOutlinedIcon />
        </ListItemIcon>
        <ListItemText
          primary="Check Results"
          secondary={
            <Box component="span">
              Wait for processing. An <strong>"Upload Summary"</strong> will
              show the outcome for each file
            </Box>
          }
        />
      </ListItem>
    </List>
  </Paper>
);

export default UploadInstructions;
