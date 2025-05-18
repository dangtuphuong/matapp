import React, { useState, useEffect } from "react";
import { Box, Checkbox } from "@mui/material";
import { Radar, Bar, Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";

import { CHART_TYPES } from "../../constants";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const COLORS = [
  "#AEC6CF", // pastel blue
  "#FFB347", // pastel orange
  "#B39EB5", // pastel purple
  "#77DD77", // pastel green
  "#FF6961", // pastel red
  "#FDFD96", // pastel yellow
  "#CBAACB", // lavender
  "#D6E2E9", // soft blue-gray
  "#FFDAC1", // peach
  "#E0BBE4", // mauve
];

const hexToRGBA = (hex, alpha = 1) => {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getMax = (type) => {
  if (type === CHART_TYPES.RADAR) return 8;
  if (type === CHART_TYPES.BUBBLE) return 3;
  return 10;
};

const Chart = ({ show = false, chartType, materials, properties }) => {
  const [max, setMax] = useState(null);
  const [filteredProps, setFilteredProps] = useState([]);

  useEffect(() => {
    setMax(getMax(chartType));
  }, [chartType]);

  const extractPropertyValues = (material, props) =>
    props?.map((targetProp) => {
      for (const category in material?.parsed_properties) {
        for (const prop in material.parsed_properties[category]) {
          if (prop.toLowerCase().includes(targetProp.toLowerCase())) {
            const metric =
              material.parsed_properties[category][prop][0]?.metric;
            return metric?.max || metric?.min || 0;
          }
        }
      }
      return 0;
    });

  const radarData = {
    labels: filteredProps,
    datasets: materials?.map((mat, index) => ({
      label: mat?.["Material Name"] || `Material ${index + 1}`,
      data: mat ? extractPropertyValues(mat, filteredProps) : [],
      backgroundColor: hexToRGBA(COLORS[index % COLORS.length], 0.9),
    })),
  };

  const barData = {
    labels: filteredProps,
    datasets: materials?.map((mat, index) => ({
      label: mat?.["Material Name"] || `Material ${index + 1}`,
      data: mat ? extractPropertyValues(mat, filteredProps) : [],
      backgroundColor: COLORS[index % COLORS.length],
    })),
  };

  const bubbleData = {
    labels: filteredProps,
    datasets: materials?.map((mat, index) => {
      const values = extractPropertyValues(mat, filteredProps);
      return {
        label: mat?.["Material Name"] || `Material ${index + 1}`,
        data: [{ x: values[0] ?? 0, y: values[1] ?? 0, r: values[2] ?? 1 }],
        backgroundColor: hexToRGBA(COLORS[index % COLORS.length], 0.9),
      };
    }),
  };

  const onChangeProps = (event, prop) => {
    const checked = event?.target?.checked;

    if (checked) {
      setFilteredProps((prev) => [...new Set([...prev, prop])]);
    } else {
      setFilteredProps((prev) => prev.filter((p) => p !== prop));
    }
  };

  useEffect(() => {
    setFilteredProps(properties?.slice(0, max));
  }, [properties?.length, max]);

  return !show ? null : (
    <Box sx={{ display: "flex", gap: 2 }}>
      {materials?.length > 0 && (
        <Box sx={{ width: 250 }}>
          {properties?.map((prop) => {
            const checked = filteredProps?.includes(prop);
            const disabled = !checked && filteredProps?.length >= max;
            return (
              <Box
                key={prop}
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  disabled={disabled}
                  checked={checked}
                  onChange={(e) => onChangeProps(e, prop)}
                />
                <span style={{ flex: 1, color: disabled ? "gray" : "black" }}>
                  {prop}
                </span>
              </Box>
            );
          })}
        </Box>
      )}

      {chartType === CHART_TYPES.RADAR && materials?.length > 0 && (
        <Box sx={{ flex: 1 }}>
          <Radar
            data={radarData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  beginAtZero: true,
                  pointLabels: {
                    color: "#333",
                    font: { size: 14 },
                  },
                  ticks: { color: "#666" },
                  grid: { color: "#ccc" },
                },
              },
              plugins: {
                legend: {
                  labels: {
                    color: "#444",
                    font: { weight: "bold" },
                  },
                },
              },
            }}
          />
        </Box>
      )}

      {chartType === CHART_TYPES.BAR && materials?.length > 0 && (
        <Box sx={{ flex: 1 }}>
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#444",
                  },
                },
              },
              scales: {
                x: {
                  ticks: { color: "#333" },
                  grid: { color: "#f2f2f2" },
                },
                y: {
                  beginAtZero: true,
                  ticks: { color: "#333" },
                  grid: { color: "#f2f2f2" },
                },
              },
            }}
          />
        </Box>
      )}
      {chartType === CHART_TYPES.BUBBLE && materials?.length > 0 && (
        <Box sx={{ flex: 1 }}>
          <Bubble
            data={bubbleData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: { color: "#444" },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: `${filteredProps[0]}`,
                    color: "#444",
                  },
                  ticks: { color: "#333" },
                  grid: { color: "#f2f2f2" },
                },
                y: {
                  title: {
                    display: true,
                    text: `${filteredProps[1]}`,
                    color: "#444",
                  },
                  ticks: { color: "#333" },
                  grid: { color: "#f2f2f2" },
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Chart;
