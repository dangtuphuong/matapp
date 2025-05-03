import React from "react";
import { Typography, Container } from "@mui/material";

import { getCategories, getProperties } from "../services/material-service";
import NavbarPrivate from "./NavbarPrivate";

const UploadPage = () => {
  return (
    <div className="upload-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
        Upload Materials
      </Typography>
      <Container sx={{ display: "flex" }}></Container>
    </div>
  );
};

export default UploadPage;
