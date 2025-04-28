import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Toolbar,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  FilterList,
  ExpandMore,
} from "@mui/icons-material";
import MaterialsTable from "./MaterialsTable";
import "./styles/SideNavbar.css";

const drawerWidth = 240;
const collapsedWidth = 72; // Width when minimized

const SideNavbar = () => {
  const [open, setOpen] = useState(true);

  // Filter states
  const [materialTypes, setMaterialTypes] = useState({
    metals: false,
    polymers: false,
    ceramics: false,
    composites: false,
    alloys: false,
    magnetic: false,
  });
  const [strengthRange, setStrengthRange] = useState([0, 1000]);
  const [conductivityRange, setConductivityRange] = useState([0, 200]);
  const [densityRange, setDensityRange] = useState([0, 10]);
  const [thermalExpansionRange, setThermalExpansionRange] = useState([0, 30]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMaterialTypeChange = (event) => {
    setMaterialTypes({
      ...materialTypes,
      [event.target.name]: event.target.checked,
    });
  };

  const handleRangeChange = (setter) => (event, newValue) => {
    setter(newValue);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        className="sidenav-root"
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: open ? drawerWidth : collapsedWidth,
            boxSizing: "border-box",
            backgroundColor: "#1a1a1a",
            color: "#ffffff",
            borderRight: "1px solid #ddd",
            top: "64px", // Fix under navbar
            height: "calc(100vh - 64px)",
            transition: "width 0.3s",
            overflowX: "hidden",
          },
        }}
      >
        {/* Toolbar for toggle button */}
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: open ? "space-between" : "center",
            alignItems: "center",
            padding: "0 8px",
          }}
        >
          {open && (
            <Typography variant="h6" noWrap>
              Filters
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Toolbar>

        <Divider sx={{ backgroundColor: "#444" }} />

        {/* Material Type Filter */}
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          <Accordion disabled={!open}>
            <AccordionSummary
              expandIcon={open ? <ExpandMore sx={{ color: "#fff" }} /> : null}
              aria-controls="material-type-content"
              id="material-type-header"
            >
              {open && (
                <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                  Material Type
                </Typography>
              )}
            </AccordionSummary>

            {open && (
              <AccordionDetails>
                <List>
                  {[
                    "metals",
                    "polymers",
                    "ceramics",
                    "composites",
                    "alloys",
                    "magnetic",
                  ].map((type) => (
                    <ListItem key={type} button sx={{ px: 2.5 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={materialTypes[type]}
                            onChange={handleMaterialTypeChange}
                            name={type}
                            sx={{ color: "#fff" }}
                          />
                        }
                        label={type.charAt(0).toUpperCase() + type.slice(1)}
                        sx={{ color: "#fff" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            )}
          </Accordion>

          <Divider sx={{ backgroundColor: "#444" }} />

          {/* Strength Filter */}
          <Accordion disabled={!open}>
            <AccordionSummary
              expandIcon={open ? <ExpandMore sx={{ color: "#fff" }} /> : null}
              aria-controls="strength-content"
              id="strength-header"
            >
              {open && (
                <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                  Strength
                </Typography>
              )}
            </AccordionSummary>

            {open && (
              <AccordionDetails>
                <ListItem sx={{ px: 2.5 }}>
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    Tensile Strength Range: {strengthRange[0]} -{" "}
                    {strengthRange[1]} MPa
                  </Typography>
                </ListItem>
                <ListItem sx={{ px: 2.5 }}>
                  <Slider
                    value={strengthRange}
                    onChange={handleRangeChange(setStrengthRange)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} MPa`}
                    min={0}
                    max={1000}
                  />
                </ListItem>
              </AccordionDetails>
            )}
          </Accordion>

          {/* Conductivity Filter */}
          <Accordion disabled={!open}>
            <AccordionSummary
              expandIcon={open ? <ExpandMore sx={{ color: "#fff" }} /> : null}
              aria-controls="conductivity-content"
              id="conductivity-header"
            >
              {open && (
                <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                  Conductivity
                </Typography>
              )}
            </AccordionSummary>

            {open && (
              <AccordionDetails>
                <ListItem sx={{ px: 2.5 }}>
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    Electrical Conductivity Range: {conductivityRange[0]} -{" "}
                    {conductivityRange[1]} S/m
                  </Typography>
                </ListItem>
                <ListItem sx={{ px: 2.5 }}>
                  <Slider
                    value={conductivityRange}
                    onChange={handleRangeChange(setConductivityRange)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} S/m`}
                    min={0}
                    max={200}
                  />
                </ListItem>
              </AccordionDetails>
            )}
          </Accordion>

          {/* Density Filter */}
          <Accordion disabled={!open}>
            <AccordionSummary
              expandIcon={open ? <ExpandMore sx={{ color: "#fff" }} /> : null}
              aria-controls="density-content"
              id="density-header"
            >
              {open && (
                <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                  Density
                </Typography>
              )}
            </AccordionSummary>

            {open && (
              <AccordionDetails>
                <ListItem sx={{ px: 2.5 }}>
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    Density Range: {densityRange[0]} - {densityRange[1]} g/cm³
                  </Typography>
                </ListItem>
                <ListItem sx={{ px: 2.5 }}>
                  <Slider
                    value={densityRange}
                    onChange={handleRangeChange(setDensityRange)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} g/cm³`}
                    min={0}
                    max={10}
                  />
                </ListItem>
              </AccordionDetails>
            )}
          </Accordion>

          {/* Thermal Expansion Filter */}
          <Accordion disabled={!open}>
            <AccordionSummary
              expandIcon={open ? <ExpandMore sx={{ color: "#fff" }} /> : null}
              aria-controls="thermal-expansion-content"
              id="thermal-expansion-header"
            >
              {open && (
                <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                  Thermal Expansion
                </Typography>
              )}
            </AccordionSummary>

            {open && (
              <AccordionDetails>
                <ListItem sx={{ px: 2.5 }}>
                  <Typography variant="body2" sx={{ color: "#fff" }}>
                    Thermal Expansion Range: {thermalExpansionRange[0]} -{" "}
                    {thermalExpansionRange[1]} x10⁻⁶ /°C
                  </Typography>
                </ListItem>
                <ListItem sx={{ px: 2.5 }}>
                  <Slider
                    value={thermalExpansionRange}
                    onChange={handleRangeChange(setThermalExpansionRange)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} x10⁻⁶ /°C`}
                    min={0}
                    max={30}
                  />
                </ListItem>
              </AccordionDetails>
            )}
          </Accordion>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <MaterialsTable />
      </Box>
    </Box>
  );
};

export default SideNavbar;
