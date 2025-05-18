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

function getCommonProperties(materials) {
  let common = [];

  for (const mat of materials) {
    const propsObj = mat?.parsed_properties;
    let props = [];

    Object.values(propsObj)?.map((v) => {
      props = [...props, ...Object.keys(v)];
    });

    if (!common?.length) {
      common = [...props];
    } else {
      common = common.filter((i) => props.includes(i));
    }
  }

  return common;
}

const Chart = ({ chartType, materials, properties }) => {
  const [filteredProps, setFilteredProps] = useState([]);

  const extractPropertyValues = (material, props) =>
    props?.map((targetProp) => {
      for (const category in material?.parsed_properties) {
        for (const prop in material.parsed_properties[category]) {
          if (prop.toLowerCase().includes(targetProp.toLowerCase())) {
            const metric =
              material.parsed_properties[category][prop][0]?.metric;
            return metric?.min || metric?.max;
          }
        }
      }
      return 0;
    });

  const radarData = {
    labels: filteredProps?.slice(0, 3),
    datasets: materials?.map((mat, index) => ({
      label: mat?.["Material Name"] || `Material ${index + 1}`,
      data: mat ? extractPropertyValues(mat, properties?.slice(0, 3)) : [],
      backgroundColor: COLORS[index],
    })),
  };

  const barData = {
    labels: filteredProps,
    datasets: materials?.map((mat, index) => ({
      label: mat?.["Material Name"] || "Material 1",
      data: mat ? extractPropertyValues(mat, filteredProps) : [],
      backgroundColor: COLORS[index],
    })),
  };

  const bubbleData = {
    labels: filteredProps?.slice(0, 3),
    datasets: materials?.map((mat, index) => {
      const values = extractPropertyValues(mat, filteredProps?.slice(0, 3));
      return {
        label: mat?.["Material Name"] || `Material ${index + 1}`,
        data: [{ x: values[0] ?? 0, y: values[1] ?? 0, r: values[2] ?? 0 }],
        backgroundColor: COLORS[index],
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
    const result = getCommonProperties(materials);
    setFilteredProps(
      result?.length > 0 ? result?.slice(0, 3) : properties?.slice(0, 3)
    );
  }, [properties?.length]);

  return (
    <>
      <Box sx={{ display: "flex", gap: 2 }}>
        {materials?.length > 0 && (
          <Box sx={{ width: 250 }}>
            {properties?.map((prop) => (
              <Box
                key={prop}
                sx={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Checkbox
                  checked={filteredProps?.includes(prop)}
                  onChange={(e) => onChangeProps(e, prop)}
                />
                <span style={{ flex: 1 }}>{prop}</span>
              </Box>
            ))}
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
                    grid: { color: "#ccc" },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: "#333" },
                    grid: { color: "#ccc" },
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
                    grid: { color: "#ccc" },
                  },
                  y: {
                    title: {
                      display: true,
                      text: `${filteredProps[1]}`,
                      color: "#444",
                    },
                    ticks: { color: "#333" },
                    grid: { color: "#ccc" },
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default Chart;
