import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { Radar, Bar } from "react-chartjs-2";
import { getAllMaterials, getMaterialByMatGUID } from "../services/material-service";
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
} from "chart.js";

import "./styles/MaterialComparisonPage.css";

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

const propertiesToCompare = [
  "Density",
  "Compressive Strength",
  "Thermal Conductivity",
  "Elastic Modulus",
  "Tensile Strength",
];

const MaterialComparisonPage = () => {
  const [materials, setMaterials] = useState([]);
  const [material1Id, setMaterial1Id] = useState("");
  const [material2Id, setMaterial2Id] = useState("");
  const [material1, setMaterial1] = useState(null);
  const [material2, setMaterial2] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    getAllMaterials({
      page: 1,
      limit: 100,
      searchTerm: "",
      searchCategories: [],
      searchProperties: [],
    })
      .then((data) => setMaterials(data.materials || []))
      .catch((err) => console.error("API error:", err));
  }, []);

  const fetchMaterialDetails = async () => {
    try {
      const [m1, m2] = await Promise.all([
        getMaterialByMatGUID(material1Id),
        getMaterialByMatGUID(material2Id),
      ]);
      setMaterial1(m1);
      setMaterial2(m2);
    } catch (err) {
      console.error("Error fetching material details", err);
    }
  };

  const extractPropertyValues = (material) =>
    propertiesToCompare.map((targetProp) => {
      for (const category in material?.Properties) {
        for (const prop in material.Properties[category]) {
          if (prop.toLowerCase().includes(targetProp.toLowerCase())) {
            const val = parseFloat(material.Properties[category][prop][0]?.Metric);
            return isNaN(val) ? 0 : val;
          }
        }
      }
      return 0;
    });

  const radarData = {
    labels: propertiesToCompare,
    datasets: [
      {
        label: material1?.["Material Name"] || "Material 1",
        data: material1 ? extractPropertyValues(material1) : [],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label: material2?.["Material Name"] || "Material 2",
        data: material2 ? extractPropertyValues(material2) : [],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  const barData = {
    labels: propertiesToCompare,
    datasets: [
      {
        label: material1?.["Material Name"] || "Material 1",
        data: material1 ? extractPropertyValues(material1) : [],
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
      {
        label: material2?.["Material Name"] || "Material 2",
        data: material2 ? extractPropertyValues(material2) : [],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  return (
    <>
      <NavbarPrivate />
      <Container className="compare-container">
        <Typography variant="h4" align="center" className="compare-header">
          Material Comparison
        </Typography>

        <div className="select-row">
          <FormControl sx={{ minWidth: 400, maxWidth: 400 }}>
            <InputLabel>Select Material 1</InputLabel>
            <Select
              value={material1Id}
              onChange={(e) => setMaterial1Id(e.target.value)}
              label="Select Material 1"
            >
              {materials.map((mat) => (
                <MenuItem key={mat.matGUID} value={mat.matGUID}>
                  {mat["Material Name"]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 400, maxWidth: 400, mx: 2 }}>
            <InputLabel>Select Material 2</InputLabel>
            <Select
              value={material2Id}
              onChange={(e) => setMaterial2Id(e.target.value)}
              label="Select Material 2"
            >
              {materials.map((mat) => (
                <MenuItem key={mat.matGUID} value={mat.matGUID}>
                  {mat["Material Name"]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={fetchMaterialDetails}
            disabled={!material1Id || !material2Id}
          >
            Compare
          </Button>
        </div>

        {/* Tabs */}
        {/*<Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          centered
          sx={{ mt: 2, mb: 4 }}
        >
          <Tab label="Table View" />
          <Tab label="Radar Chart" />
          <Tab label="Bar Chart" />
        </Tabs>*/}

        {/* Tab Content */}
        <Box className="chart-wrapper">
          {activeTab === 0 && material1 && material2 && (
            <Box className="table-comparison">
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                Property Comparison Table
              </Typography>
              <Paper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Property</TableCell>
                      <TableCell>{material1["Material Name"]}</TableCell>
                      <TableCell>{material2["Material Name"]}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {propertiesToCompare.map((prop, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{prop}</TableCell>
                        <TableCell>{extractPropertyValues(material1)[idx]}</TableCell>
                        <TableCell>{extractPropertyValues(material2)[idx]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {activeTab === 1 && material1 && material2 && (
            <Radar
              data={radarData}
              options={{
                responsive: true,
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
          )}

          {activeTab === 2 && material1 && material2 && (
            <Bar
              data={barData}
              options={{
                responsive: true,
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
          )}
        </Box>
      </Container>
    </>
  );
};

export default MaterialComparisonPage;
