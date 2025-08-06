import React from "react";
import {
  Button,
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import RadarIcon from "@mui/icons-material/TrackChanges";
import DescriptionIcon from "@mui/icons-material/Description";
import SearchIcon from "@mui/icons-material/Search";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import BarChart from "@mui/icons-material/BarChart";

import NavbarPublic from "../NavbarPublic";

const PRIMARY_COLOR = "#338FCC";

const itemStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: 1,
};

const cardStyle = {
  boxShadow: "none",
  border: "1px solid #0000001F",
  borderRadius: "7px",
  backgroundColor: "#f9f9f9",
};

const PublicHome = () => {
  return (
    <>
      <NavbarPublic />

      <Box
        sx={{
          backgroundColor: PRIMARY_COLOR,
          color: "#FFFFFFE5",
          padding: "4rem 0",
          marginTop: "-1px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" align="center" gutterBottom>
            Search and Compare Materials
          </Typography>
          <Typography
            variant="h6"
            align="center"
            paragraph
            sx={{ maxWidth: 1000 }}
          >
            Explore thousands of materials and accelerate material discovery
            using advanced search tools, property comparisons, and interactive
            charts to simplify selection for engineers, students, and
            researchers.
          </Typography>
        </Box>

        {/* Main Actions */}
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 4 }}>
          <Grid>
            <Button
              variant="outlined"
              color="white"
              size="large"
              startIcon={<SearchIcon />}
              href="/search"
            >
              Traditional Search
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              color="white"
              size="large"
              startIcon={<TroubleshootIcon />}
              href="/smart-search"
            >
              Smart Search (LLM & Vector)
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              color="white"
              size="large"
              href="/compare-page"
              startIcon={<BarChart />}
            >
              Compare Materials
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        {/* Feature Highlights */}
        <Grid container spacing={4} m={4}>
          <Grid size={6}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={itemStyle}>
                  <TroubleshootIcon color="primary" sx={{ marginRight: 1 }} />
                  <span>Smart AI-Powered Search</span>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Use advanced vector search and large language models (LLMs) to
                  find materials through natural language queries, eliminating
                  the need for complex filters or manual search parameters.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={6}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={itemStyle}>
                  <SearchIcon color="primary" sx={{ marginRight: 1 }} />
                  <span>Traditional Search</span>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Find materials quickly using filters based on categories and
                  multiple properties, including text and range values. Browse
                  thousands of materials with precision and control.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={6}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={itemStyle}>
                  <DescriptionIcon color="primary" sx={{ marginRight: 1 }} />
                  <span>View & Download Material Details</span>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Explore comprehensive material profiles, including categories,
                  properties, and metadata. Easily download material details as
                  a PDF for offline reference and reporting.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={6}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography variant="h6" sx={itemStyle}>
                  <RadarIcon color="primary" sx={{ marginRight: 1 }} />
                  <span>Visualize Materials with Charts</span>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Compare and explore materials using interactive visualizations
                  including radar charts, bar charts, and bubble charts. Analyze
                  material properties and trends at a glance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        {/* <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mt: 6, padding: 2 }}
        >
          2025 Material Search App
        </Typography> */}
      </Container>
    </>
  );
};

export default PublicHome;
