import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  IconButton,
  Tooltip as IconTooltip,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import NavbarPrivate from "./NavbarPrivate";
import { getAllMaterials } from "../services/material-service";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title);

const COLORS = [
  "#4dc9f6",
  "#f67019",
  "#f53794",
  "#537bc4",
  "#acc236",
  "#ffa600",
  "#8dd3c7",
  "#e7298a",
  "#66a61e",
  "#ff7f00",
];

const BubbleChart = () => {
  const [materials, setMaterials] = useState([]);
  const location = useLocation();
  const { searchCategories = [], searchProperties = [] } =
    location?.state || {};

  useEffect(() => {
    getAllMaterials({
      page: 1,
      limit: 100,
      searchTerm: "",
      searchCategories,
      searchProperties,
    })
      .then((data) => {
        setMaterials(data?.materials || []);
      })
      .catch((err) => console.error("Error loading materials:", err));
  }, [searchCategories, searchProperties]);

  const groupByTopLevelCategory = (materials) => {
    const grouped = {};
    materials.forEach((material) => {
      material.Categories?.forEach((cat) => {
        grouped[cat] = (grouped[cat] || 0) + 1;
      });
    });
    return grouped;
  };

  const grouped = groupByTopLevelCategory(materials);
  const categoryNames = Object.keys(grouped);

  const data = {
    datasets: categoryNames.map((cat, i) => ({
      label: cat,
      data: [
        {
          x: grouped[cat],
          y: cat,
          r: Math.sqrt(grouped[cat]) * 3,
        },
      ],
      backgroundColor: COLORS[i % COLORS.length],
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: "Materials per Category",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const x = context.raw.x;
            const r = context.raw.r;
            return `${label}: ${x} materials`;
          },
        },
      },
    },

    scales: {
      x: {
        type: "linear",
        title: {
          display: true,
          text: "Material Count",
        },
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: {
          display: false,
        },
      },
      y: {
        type: "category",
        title: {
          display: true,
          text: "Category",
        },
        labels: categoryNames,
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <>
      <NavbarPrivate />
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 20, left: 20 }}>
          <IconTooltip title={"Back to search page"}>
            <IconButton component={Link} sx={{ float: "left" }} to="/search">
              <KeyboardBackspaceIcon />
            </IconButton>
          </IconTooltip>
        </div>
      </div>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          px: 2,
          my: 4,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 3 }}>
          Bubble Chart: Material Count by Category (Filtered)
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "calc(100vh - 200px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bubble
            data={data}
            options={{
              ...options,
              maintainAspectRatio: false,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
      </Container>
    </>
  );
};

export default BubbleChart;
