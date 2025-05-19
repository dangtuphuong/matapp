import React from "react";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  PointElement,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Box, Typography } from "@mui/material";

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

const processData = (materials) => {
  const grouped = {};
  materials.forEach((material) => {
    material.Categories?.forEach((cat) => {
      grouped[cat] = (grouped[cat] || 0) + 1;
    });
  });
  return grouped;
};

const BubbleChart = ({ materials, currentPage }) => {
  const groupedData = processData(materials);
  const categoryNames = Object.keys(groupedData);

  const data = {
    datasets: categoryNames.map((cat, i) => ({
      label: cat,
      data: [
        {
          x: groupedData[cat],
          y: cat,
          r: Math.sqrt(groupedData[cat]) * 5,
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
        text: `Materials per Category - Page ${currentPage}`,
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
        ticks: {
          padding: 20, // Adds padding on the x-axis
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: "category",
        labels: categoryNames,
        title: {
          display: true,
          text: "Category",
        },
        ticks: {
          padding: 20, // Adds padding on the y-axis
        },
        grid: {
          display: false,
        },
        afterDataLimits: (scale) => {
          scale.max += 0.5; // Add space at the bottom
        },
      },
    },
    layout: {
      padding: {
        bottom: 30,  // Add bottom padding
      },
    },
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        Bubble Chart - Materials per Category (Page {currentPage})
      </Typography>
      <Bubble data={data} options={options} />
    </Box>
  );
};

export default BubbleChart;
