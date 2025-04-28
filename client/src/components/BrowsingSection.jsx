import React from "react";
import { Box, Typography } from "@mui/material";
import dummyMaterials from "../data/dummyMaterials"; // adjust path if needed

const BrowsingSection = () => {
  return (
    <Box sx={{ mt: 2 }}>
      {dummyMaterials.map((item) => (
        <Box
          key={item.id}
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: 1,
          }}
        >
          <Typography variant="h6">{item.name}</Typography>
          <Typography variant="body2">
            Material Type: {item.materialType}
          </Typography>
          <Typography variant="body2">Strength: {item.strength} MPa</Typography>
          <Typography variant="body2">
            Conductivity: {item.conductivity} S/m
          </Typography>
          <Typography variant="body2">Density: {item.density} g/cm³</Typography>
          <Typography variant="body2">
            Thermal Expansion: {item.thermalExpansion} x10⁻⁶ /°C
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default BrowsingSection;
