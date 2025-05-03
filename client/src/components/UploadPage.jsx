import React, { useState } from "react";
import { Box, Button, Typography, Alert, Card, Container } from "@mui/material";
import Upload from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import { styled } from "@mui/material/styles";

import NavbarPrivate from "./NavbarPrivate";
import { uploadMaterial } from "../services/material-service";
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
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/json" &&
      !selectedFile.name.endsWith(".json")
    ) {
      setError("Please upload a JSON file");
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setPreviewData(jsonData);
      } catch (err) {
        setError("Invalid JSON file", err);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleFileSubmit = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      await uploadMaterial(file);
      setFile(null);
      setPreviewData(null);
    } catch (error) {
      setError(error.message || "Failed to upload file");
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
    } catch (error) {
      setError("Failed to generate example file: ", error);
    }
  };

  return (
    <div className="upload-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
        Upload Materials
      </Typography>
      <Container>
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
          <Card
            sx={{
              ...cardStyle,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ m: 1, display: "flex", gap: 4 }}>
              <Button
                variant="outlined"
                onClick={downloadExampleJson}
                startIcon={<DownloadIcon />}
              >
                Example JSON
              </Button>
              <Button
                component="label"
                role={undefined}
                variant="outlined"
                startIcon={<Upload />}
              >
                Select JSON File
                <VisuallyHiddenInput type="file" onChange={handleFileChange} />
              </Button>
            </Box>

            {file && (
              <Typography
                variant="body1"
                sx={{ fontStyle: "italic", color: "#757575", m: 1 }}
              >
                Selected: {file.name}
              </Typography>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {previewData && (
              <Card
                sx={{
                  p: 2,
                  mt: 2,
                  backgroundColor: "#f5f5f5",
                  boxShadow: "none",
                }}
              >
                <Typography variant="body2">
                  {JSON.stringify(previewData, null, 2)}
                </Typography>
              </Card>
            )}

            {!!file && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFileSubmit}
                sx={{ mt: 2 }}
              >
                {uploading ? "Uploading..." : "Upload JSON File"}
              </Button>
            )}
          </Card>
        </Box>
      </Container>
    </div>
  );
};

export default UploadPage;
