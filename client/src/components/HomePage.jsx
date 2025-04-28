import NavbarPrivate from "./NavbarPrivate";
import React from "react";
import { Typography, Container } from "@mui/material";

import MaterialsTable from "./MaterialsTable";

import "./styles/navbar.css";
import "./styles/Home.css";

const HomePage = () => {
  return (
    <>
      {/* Private Navbar with username */}
      <NavbarPrivate />

      {/* Home Page Content */}
      <Container className="home-container">
        <Typography variant="h4" className="home-title">
          MatApp Home Page
        </Typography>
        <Typography variant="body1" className="home-message">
          You are logged in successfully!
        </Typography>

        <MaterialsTable />
        <br />
      </Container>
    </>
  );
};

export default HomePage;
