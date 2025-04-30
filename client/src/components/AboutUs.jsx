import React from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import FlexibleRoute from "./FlexibleRoute";
import "./styles/AboutUs.css";

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

const AboutUs = () => {
  return (
    <>
      <Container className="aboutus-container">
        {/* Hero section */}
        <Box className="aboutus-hero">
          <Typography variant="h3" className="aboutus-title">
            About Us
          </Typography>
          <Typography variant="body1" className="aboutus-intro">
            Welcome to MatApp! Inspired by tools like MatWeb, our project
            centers around a searchable database for engineering
            materials—making it easier for students and professionals to find
            the right material for the job.
          </Typography>
        </Box>

        {/* Project background */}
        <Box className="aboutus-mission">
          <Typography variant="h5" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            This project was created by a team of Master of Information
            Technology students from Swinburne University of Technology as part
            of our final year capstone project. Our goal is to demonstrate our
            capability to design and build a full-stack web application that is
            not only technically sound but also practically useful, particularly
            in the field of engineering and materials education.
          </Typography>
          <Typography variant="body1">
            We are passionate about supporting learners and professionals in
            accessing reliable and relevant material data, and we hope MatApp
            contributes meaningfully to that mission.
          </Typography>
        </Box>

        {/* Team cards */}
        <Box className="aboutus-team">
          <Typography variant="h5" className="section-title" gutterBottom>
            Meet the Team
          </Typography>

          <Box display="flex" justifyContent="center">
            <Grid container spacing={3} justifyContent="center" maxWidth="md">
              {teamMembers.map((member, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card className="team-card" elevation={3}>
                    <CardContent style={{ textAlign: "center" }}>
                      <Typography variant="h6">{member.name}</Typography>
                      <Typography variant="body2">
                        Student ID: {member.id}
                      </Typography>
                      <Typography variant="body2" className="email-text">
                        <a
                          href={`mailto:${member.email}`}
                          className="email-link"
                        >
                          {member.email}
                        </a>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AboutUs;
