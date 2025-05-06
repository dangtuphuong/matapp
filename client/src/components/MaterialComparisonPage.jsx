import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Radar } from "react-chartjs-2";
import {
  getAllMaterials,
  getMaterialByMatGUID,
} from "../services/material-service";
import NavbarPrivate from "./NavbarPrivate";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import "./styles/MaterialComparisonPage.css";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Properties you want to compare
const propertiesToCompare = [
  "Density",
  "Compressive Strength",
  "Thermal Conductivity",
  "Elastic Modulus",
  "Tensile Strength",
];

// MaterialComparisonPage component
const MaterialComparisonPage = () => {
  const [materials, setMaterials] = useState([]);
  const [material1Id, setMaterial1Id] = useState("");
  const [material2Id, setMaterial2Id] = useState("");
  const [material1, setMaterial1] = useState(null);
  const [material2, setMaterial2] = useState(null);

  // Fetch all materials with pagination and set them
  useEffect(() => {
    getAllMaterials({
      page: 1,
      limit: 100,
      searchTerm: "",
      searchCategories: [],
      searchProperties: [],
    })
      .then((data) => {
        setMaterials(data.materials || []);
      })
      .catch((err) => {
        console.error("API error:", err);
      });
  }, []);

  // Fetch material details when material IDs change
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

  // Function to extract property values from material object
  const extractPropertyValues = (material) => {
    return propertiesToCompare.map((targetProp) => {
      for (const category in material?.Properties) {
        for (const prop in material.Properties[category]) {
          if (prop.toLowerCase().includes(targetProp.toLowerCase())) {
            const val = parseFloat(
              material.Properties[category][prop][0]?.Metric
            );
            return isNaN(val) ? 0 : val;
          }
        }
      }
      return 0;
    });
  };

  // Prepare data for the chart
  const radarData = {
    labels: propertiesToCompare,
    datasets: [
      {
        label: material1?.mat_name || "Material 1",
        data: material1 ? extractPropertyValues(material1) : [],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
      {
        label: material2?.mat_name || "Material 2",
        data: material2 ? extractPropertyValues(material2) : [],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      {/* Navbar */}
      <NavbarPrivate />

      <Container className="compare-container">
        <Typography
          className="compare-header"
          variant="h4"
          align="center"
          sx={{ mt: 4, mb: 3 }}
        >
          Material Comparison
        </Typography>

        {/* Select Materials */}
        <div className="select-row">
          <FormControl sx={{ minWidth: 350, maxWidth: 350 }}>
            <InputLabel>Select Material 1</InputLabel>
            <Select
              value={material1Id}
              onChange={(e) => setMaterial1Id(e.target.value)}
              label="Select Material 1"
            >
              {materials.map((mat) => (
                <MenuItem key={mat.matGUID} value={mat.matGUID}>
                  {mat?.mat_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 350, maxWidth: 350, mx: 2 }}>
            <InputLabel>Select Material 2</InputLabel>
            <Select
              value={material2Id}
              onChange={(e) => setMaterial2Id(e.target.value)}
              label="Select Material 2"
            >
              {materials.map((mat) => (
                <MenuItem key={mat.matGUID} value={mat.matGUID}>
                  {mat?.mat_name}
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

        {/* Radar Chart */}
        <div className="chart-wrapper">
          {material1 && material2 && (
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
        </div>
      </Container>
    </>
  );
};

export default MaterialComparisonPage;
