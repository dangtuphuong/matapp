import React from "react";
import {
  Search,
  BarChart,
  Refresh,
  Group,
  Lightbulb,
  Psychology,
  RocketLaunch,
  CheckCircle,
} from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlexibleRoute from "./FlexibleRoute";
import "./styles/AboutUsPage.css";

const AboutUsPage = () => {
  // Values and mission
  const values = [
    {
      title: "Scientific Excellence",
      description:
        "We base our recommendations on rigorous testing and the latest research in materials science.",
      icon: <Search className="icon" />,
    },
    {
      title: "Data-Driven Decisions",
      description:
        "Our proprietary database and analytics tools help you make informed material choices.",
      icon: <BarChart className="icon" />,
    },
    {
      title: "Sustainability Focus",
      description:
        "We're committed to helping our clients reduce their environmental impact through better material choices.",
      icon: <Refresh className="icon" />,
    },
    {
      title: "Collaborative Approach",
      description:
        "We work alongside your team to understand your unique challenges and requirements.",
      icon: <Group className="icon" />,
    },
  ];

  // Features
  const features = [
    {
      title: "Innovation in Materials",
      description:
        "We harness a curated database of over 80,000 materials to deliver smarter, faster, and more accurate selection tools driven by real data and modern design thinking",
      icon: <Lightbulb className="icon" />,
    },
    {
      title: "Smart Decision Support",
      description:
        "Helping users choose the right materials with confidence and clarity.",
      icon: <RocketLaunch className="icon" />,
    },
    {
      title: "In-Depth Analysis",
      description:
        "Our platform simplifies complex comparisons using structured data, visualization, and property-based analysis.",
      icon: <Psychology className="icon" />,
    },
  ];

  const teamMembers = []; // or null if preferred

  const [openTeamModal, setOpenTeamModal] = React.useState(false);

  return (
    <>
      {/* Header section */}
      <div className="about-hero" style={{ margin: "-2.1rem" }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>
            About <span>MatApp </span>
          </h1>
          <p>
            <span>MatApp</span> is a next-generation platform designed to
            simplify material selection and property analysis for engineers,
            designers, and researchers. With a powerful database, intelligent
            search capabilities, and AI-driven comparison tools, we help
            organisations identify the best materials for their products faster
            and more accurately.
          </p>
        </div>
      </div>
      {/* Values & Mission sections */}
      <section className="section-light">
        <div className="section-header">
          <h2>Our Values & Mission</h2>
          <p>
            At MatApp, our values are rooted in innovation, precision, and
            accessibility. We believe that every engineer, researcher, or
            designer should have access to clear, data-driven material insights.
            Our mission is to transform the process of material selection making
            it smarter, faster, and more sustainable.
          </p>
        </div>

        {/* Values grid sections*/}
        <div className="grid-2">
          {values.map((val, idx) => (
            <div key={idx} className="value-card">
              {val.icon}
              <div>
                <h3>{val.title}</h3>
                <p>{val.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Features section */}
      <section className="section-gray">
        <div className="section-header">
          <h2>Transforming Material Selection</h2>
          <p>
            We’re redefining how materials are explored, evaluated, and applied.
            Our platform empowers users to navigate complex data effortlessly,
            compare properties intelligently, and make confident decisions with
            speed and accuracy.
          </p>
        </div>

        {/* Features grid sections*/}
        <div className="grid-3">
          {features.map((f, idx) => (
            <div key={idx} className="feature-card">
              {f.icon}
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Box textAlign="center" mt={4}>
        <button
          className="contact-dev-button"
          onClick={() => setOpenTeamModal(true)}
        >
          Contact the Developers
        </button>
      </Box>

      <Dialog
        open={openTeamModal}
        onClose={() => setOpenTeamModal(false)}
        fullWidth
        maxWidth="md"
        className="team-dialog"
      >
        <DialogTitle>
          Meet the Team
          <IconButton
            aria-label="close"
            onClick={() => setOpenTeamModal(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center">
            {teamMembers.length === 0 ? (
              <Typography variant="body1" align="center">
                Please contact website admin for more info.
              </Typography>
            ) : (
              <Grid container spacing={3} justifyContent="center">
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
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AboutUsPage;
