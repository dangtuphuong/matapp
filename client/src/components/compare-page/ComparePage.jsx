import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Tabs,
  Tab,
  Box,
  Autocomplete,
  Container,
  TextField,
  Paper,
  Stack,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import BarChartIcon from "@mui/icons-material/BarChart";
import HighlightAltIcon from "@mui/icons-material/HighlightAlt";
import { getAllMaterials } from "../../services/material-service";
import CollapsibleTable from "./CollapsibleTable";
import Chart from "./Chart";
import { CHART_TYPES } from "../../constants";

const emptyStyle = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  color: "#505050",
};

const EmptyState = () => (
  <Box sx={{ display: "flex", justifyContent: "center", mb: 3, mt: 4 }}>
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 2.5, backgroundColor: "#f9f9f9", width: 800 }}
    >
      <Stack spacing={1}>
        <Typography sx={emptyStyle} variant="body2">
          <CompareArrowsIcon fontSize="small" />
          <strong>Flexible Comparison:</strong> Compare two or more materials at
          once.
        </Typography>
        <Typography sx={emptyStyle} variant="body2">
          <BarChartIcon fontSize="small" />
          <strong>Comprehensive View:</strong> View all properties found across
          the selected materials, with visual comparisons.
        </Typography>
        <Typography sx={emptyStyle} variant="body2">
          <HighlightAltIcon fontSize="small" />
          <strong>Highlight Differences:</strong> Quickly identify how materials
          differ across selected properties.
        </Typography>
      </Stack>
    </Paper>
  </Box>
);

const ComparePage = () => {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [materials, setMaterials] = useState([]);
  const [selectedMats, setSelectedMats] = useState([]);
  const [selectedProps, setSelectedProps] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const fetchMaterials = useCallback((params) => {
    setLoading(true);
    return getAllMaterials(params)
      .then((data) => {
        setMaterials(
          data?.materials?.map((item) => ({
            label: item?.["Material Name"],
            ...(item || {}),
          })) || []
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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

  const onSelectMat = (event, selectedOption) => {
    if (!selectedOption) return;
    const isExisted = selectedMats?.some(
      (mat) => mat?.matGUID === selectedOption.matGUID
    );
    if (isExisted) return;
    setSelectedMats((prev) => [...prev, selectedOption]);
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

  const handleDeleteMat = (id) => {
    setSelectedMats(selectedMats?.filter(({ matGUID }) => matGUID !== id));
  };

  return (
    <>
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

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Box sx={{ width: 800 }}>
            <Autocomplete
              fullWidth
              key={selectedMats?.length}
              loading={loading}
              size="small"
              options={materials}
              renderInput={(p) => (
                <TextField {...p} label={"Start typing to find a material"} />
              )}
              onInputChange={(event, newInputValue) =>
                setInputValue(newInputValue)
              }
              onChange={onSelectMat}
            />
          </Box>
        </Box>

        {selectedMats?.length > 0 ? (
          <>
            <Box sx={{ m: "30px 0" }}>
              <Box className="table-comparison-horizontal">
                <CollapsibleTable
                  rows={selectedMats}
                  onDelete={handleDeleteMat}
                />
              </Box>
            </Box>
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

            <Chart
              show={activeTab === 0}
              chartType={CHART_TYPES.RADAR}
              materials={selectedMats}
              properties={selectedProps}
            />

            <Chart
              show={activeTab === 1}
              chartType={CHART_TYPES.BAR}
              materials={selectedMats}
              properties={selectedProps}
            />

            <Chart
              show={activeTab === 2}
              chartType={CHART_TYPES.BUBBLE}
              materials={selectedMats}
              properties={selectedProps}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </Container>
    </>
  );
};

export default ComparePage;
