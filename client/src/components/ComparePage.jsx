// MaterialComparisonPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Autocomplete,
  Container,
  Checkbox,
  TextField,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { Radar, Bar, Bubble } from "react-chartjs-2";
import { getAllMaterials } from "../services/material-service";
import NavbarPrivate from "./NavbarPrivate";
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

const headerStyle = {
  fontWeight: "bold",
  backgroundColor: "#f0f0f0",
  fontSize: "16px",
};

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

function Row({ material, onDelete }) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ backgroundColor: "#FAFAFA" }}>
        <TableCell component="th" scope="row">
          {material?.["Material Name"]}
        </TableCell>
        <TableCell>{material?.Categories?.join(", ")}</TableCell>
        <TableCell align="right">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
          <IconButton
            aria-label="delete"
            size="small"
            sx={{ marginLeft: "10px" }}
            onClick={() => onDelete(material?.matGUID)}
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <TableContainer>
              {Object.entries(material?.["Properties"] ?? {}).map(
                ([key, items]) => (
                  <Table key={key}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerStyle}>{key}</TableCell>
                        <TableCell sx={headerStyle} align="right">
                          Metric
                        </TableCell>
                        <TableCell sx={headerStyle} align="right">
                          English
                        </TableCell>
                        <TableCell sx={headerStyle} align="right">
                          Comments
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(items).map(([property, values]) =>
                        values.map((value, index) => (
                          <TableRow key={`${property}-${index}`}>
                            {index === 0 && (
                              <TableCell rowSpan={values.length}>
                                {property}
                              </TableCell>
                            )}
                            <TableCell align="right">{value.Metric}</TableCell>
                            <TableCell align="right">{value.English}</TableCell>
                            <TableCell align="right">
                              {value.Comments}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )
              )}
            </TableContainer>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

function CollapsibleTable({ rows, onDelete }) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableBody>
          {rows.map((row) => (
            <Row key={row?.matGUID} material={row} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const ComparePage = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [materials, setMaterials] = useState([]);
  const [selectedMat, setSelectedMat] = useState(null);
  const [selectedMats, setSelectedMats] = useState([]);
  const [selectedProps, setSelectedProps] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [filteredProps, setFilteredProps] = useState([]);

  const fetchMaterials = useCallback((params) => {
    return getAllMaterials(params)
      .then((data) => {
        setMaterials(
          data?.materials?.map((item) => ({
            label: item?.["Material Name"],
            ...(item || {}),
          })) || []
        );
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMaterials({
        page: 1,
        limit: 100,
        searchTerm: inputValue,
      });
    }, 300);

    return () => {
      clearTimeout(delayDebounce);
    };
  }, [inputValue]);

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
    datasets: selectedMats?.map((mat, index) => ({
      label: mat?.["Material Name"] || `Material ${index + 1}`,
      data: mat ? extractPropertyValues(mat, selectedProps?.slice(0, 3)) : [],
      backgroundColor: COLORS[index],
    })),
  };

  const barData = {
    labels: filteredProps,
    datasets: selectedMats?.map((mat, index) => ({
      label: mat?.["Material Name"] || "Material 1",
      data: mat ? extractPropertyValues(mat, filteredProps) : [],
      backgroundColor: COLORS[index],
    })),
  };

  const bubbleData = {
    labels: filteredProps?.slice(0, 3),
    datasets: selectedMats?.map((mat, index) => {
      const values = extractPropertyValues(mat, filteredProps?.slice(0, 3));
      return {
        label: mat?.["Material Name"] || `Material ${index + 1}`,
        data: [{ x: values[0] ?? 0, y: values[1] ?? 0, r: values[2] ?? 0 }],
        backgroundColor: COLORS[index],
      };
    }),
  };

  const onSelectMat = (event, selectedOption) => {
    setSelectedMat(selectedOption);
  };

  const onSelectMats = () => {
    if (!selectedMat) return;
    setSelectedMats([...selectedMats, selectedMat]);
    setSelectedMat(null);
    setInputValue("");
  };

  useEffect(() => {
    let allProps = [];
    selectedMats?.forEach((mat) => {
      const props = Object.entries(mat?.Properties ?? {})
        ?.map(([k, v]) => {
          if (k === "Descriptive Properties") {
            return {};
          }
          return v;
        })
        ?.map(Object.keys)
        ?.flat();
      allProps = [...new Set([...allProps, ...props])];
    });
    setSelectedProps(allProps);
  }, [selectedMats?.length]);

  const onChangeProps = (event, prop) => {
    const checked = event?.target?.checked;

    if (checked) {
      setFilteredProps((prev) => [...new Set([...prev, prop])]);
    } else {
      setFilteredProps((prev) => prev.filter((p) => p !== prop));
    }
  };

  const handleDeleteMat = (id) => {
    setSelectedMats(selectedMats?.filter(({ matGUID }) => matGUID !== id));
  };

  useEffect(() => {
    const result = getCommonProperties(selectedMats);
    setFilteredProps(
      result?.length > 0 ? result?.slice(0, 3) : selectedProps?.slice(0, 3)
    );
  }, [selectedProps?.length]);

  return (
    <>
      <NavbarPrivate />
      <Container
        sx={{
          px: { xs: 1, sm: 2, md: 4 },
          py: 3,
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
          transform: {
            xs: "scale(0.9)",
            sm: "scale(0.95)",
            md: "scale(1)",
          },
          transformOrigin: "top center",
        }}
      >
        <Typography variant="h4" align="center">
          <span>Material Comparison</span>
        </Typography>

        <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
          <Autocomplete
            fullWidth
            key={selectedMat?.label}
            size="small"
            options={materials}
            renderInput={(p) => (
              <TextField
                {...p}
                label={selectedMat?.label || "Search for a material"}
              />
            )}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            onChange={onSelectMat}
          />

          <Button
            variant="contained"
            onClick={onSelectMats}
            disabled={!selectedMat}
          >
            <span>Add</span>
          </Button>
        </Box>

        <Box sx={{ m: "20px 0" }}>
          {selectedMats?.length > 0 && (
            <Box className="table-comparison-horizontal">
              <CollapsibleTable
                rows={selectedMats}
                onDelete={handleDeleteMat}
              />
            </Box>
          )}
        </Box>
        {selectedMats?.length > 0 && (
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            centered
            sx={{ m: 4 }}
          >
            <Tab label="Radar Chart" />
            <Tab label="Bar Chart" />
            <Tab label="Bubble Chart" />
          </Tabs>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          {selectedMats?.length > 0 && (
            <Box sx={{ width: 250 }}>
              {selectedProps?.map((prop) => (
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

          {activeTab === 0 && selectedMats?.length > 0 && (
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

          {activeTab === 1 && selectedMats?.length > 0 && (
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
          {activeTab === 2 && selectedMats?.length > 0 && (
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
      </Container>
    </>
  );
};

export default ComparePage;
