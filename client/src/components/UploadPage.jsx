import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Alert,
  Card,
  Container,
  Divider,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import Upload from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import { styled } from "@mui/material/styles";

import NavbarPrivate from "./NavbarPrivate";
import { uploadMaterials } from "../services/material-service";
import UploadInstructions from "./UploadInstruction";
import exampleData from "../utils/jsonExample.json";

const cardStyle = {
  boxShadow: "none",
  border: "1px solid #ccc",
  padding: "20px 30px",
};

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UploadPage = () => {
  const [files, setFiles] = useState(null);
  const [error, setError] = useState(null);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      setFiles(null);
      setError(null);
      setUploadResults([]);
      return;
    }

    let fileError = null;
    const validFiles = [];

    for (const file of selectedFiles) {
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        fileError =
          "Please select only JSON files. Invalid file detected: " + file.name;
        break;
      }
      validFiles.push(file);
    }

    if (fileError) {
      setError(fileError);
      setFiles(null);
      setUploadResults([]);
      event.target.value = null;
    } else {
      setFiles(selectedFiles);
      setError(null);
      setUploadResults([]);
    }
  };

  const handleFileSubmit = async () => {
    if (!files || files.length === 0) {
      setError("Please select files first");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadResults([]);

      const results = await uploadMaterials(files);
      setUploadResults(Array.isArray(results) ? results : []);

      setFiles(null);
      const fileInput = document.getElementById("hidden-file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setError(error.message);
      setUploadResults([]);
    } finally {
      setUploading(false);
    }
  };

  const downloadExampleJson = () => {
    try {
      const jsonString = JSON.stringify(exampleData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "material_example.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setError(null);
    } catch (error) {
      console.error("Failed to generate example file:", error);
      setError("Failed to generate example file.");
    }
  };

  const getResultIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon color="success" />;
      case "exists":
        return <WarningIcon color="warning" />;
      case "skipped":
        return <WarningIcon color="disabled" />;
      case "error":
        return <ErrorIcon color="error" />;
      default:
        return <DescriptionIcon />;
    }
  };

  return (
    <div className="upload-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
        Upload Material Files
      </Typography>
      <Container>
        <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Display results list */}
          {uploadResults.length > 0 && (
            <Card sx={{ ...cardStyle, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upload Details
              </Typography>
              <List dense>
                {uploadResults.map((result, index) => (
                  <React.Fragment key={index}>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: "40px" }}>
                        {getResultIcon(result.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={`${
                          result.filename || `File ${index + 1}`
                        }: ${result.status.toUpperCase()}`}
                        secondary={
                          <>
                            {result.message} -
                            {(result.status === "success" ||
                              result.status === "exists") &&
                              result.matGUID && (
                                <Link
                                  sx={{
                                    marginLeft: 1,
                                    display: "inline-block",
                                  }}
                                  component={RouterLink}
                                  to={`/material/${result.matGUID}`}
                                >
                                  View Material
                                </Link>
                              )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < uploadResults?.length - 1 && (
                      <Divider sx={{ color: "#bdbdbd", m: "10px 0" }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          )}

          <Card
            sx={{
              ...cardStyle,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                m: 1,
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button
                variant="outlined"
                onClick={downloadExampleJson}
                startIcon={<DownloadIcon />}
                disabled={uploading}
              >
                Example JSON
              </Button>
              <Button
                component="label"
                role={undefined}
                variant="outlined"
                startIcon={<Upload />}
                disabled={uploading}
              >
                Select JSON Files
                <VisuallyHiddenInput
                  id="hidden-file-input"
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept=".json,application/json"
                />
              </Button>
            </Box>

            {files?.length > 0 && (
              <Box sx={{ width: "100%", mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Selected Files:
                </Typography>
                <List
                  dense
                  sx={{
                    maxHeight: 200,
                    overflow: "auto",
                    border: "1px solid #eee",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {Array.from(files).map((file, index) => (
                    <React.Fragment key={index}>
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: "30px", m: 1 }}>
                          <DescriptionIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(1)} KB`}
                        />
                      </ListItem>
                      {index < Array.from(files)?.length - 1 && (
                        <Divider sx={{ color: "#bdbdbd" }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {files && files.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFileSubmit}
                disabled={uploading}
                sx={{ mt: 3 }}
                startIcon={
                  uploading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {uploading
                  ? `Uploading ${files.length} file(s)...`
                  : `Upload ${files.length} file(s)`}
              </Button>
            )}
          </Card>
          <UploadInstructions />
        </Box>
      </Container>
      <br />
    </div>
  );
};

export default UploadPage;
