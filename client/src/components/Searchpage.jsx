import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  TextField,
  Container,
  Autocomplete,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import { getCategories, getProperties } from "../services/material-service";
import NavbarPrivate from "./NavbarPrivate";
import MaterialsTable from "./MaterialsTable";

const convertTreeData = (data) =>
  data?.map(({ name, children }) => ({
    id: name,
    label: name,
    ...(children && { children: convertTreeData(children) }),
  }));

const convertGroupedData = (data) =>
  data?.flatMap((propGroup) =>
    propGroup.properties.map((p) => ({
      label: p?.name,
      group: propGroup?.name,
      units: p?.units,
    }))
  );

const PropertyFilterItem = ({ properties, onAdd }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const onChangeUnit = (e) => {
    const selectedUnit = selectedProperty?.units?.find(
      (u) => u.unit === e.target.value
    );
    setSelectedUnit(selectedUnit);
  };

  const onSelectProperty = (event, selectedOption) => {
    setSelectedProperty(selectedOption);
  };

  const handleAdd = () => {
    const minValue = Number(min);
    const maxValue = Number(max);

    if (isNaN(minValue) || isNaN(maxValue)) {
      alert("Please enter valid numeric values for min and max.");
      return;
    }

    onAdd({
      name: selectedProperty?.label,
      ...(min !== "" && { min: Number(min) }),
      ...(max !== "" && { max: Number(max) }),
      unit: selectedUnit?.unit,
    });
  };

  return (
    <Box>
      <Autocomplete
        fullWidth
        options={properties}
        groupBy={(option) => option?.group}
        renderInput={(p) => <TextField {...p} label="Property" />}
        onChange={onSelectProperty}
      />

      {selectedProperty && (
        <Box sx={{ m: "10px 0" }}>
          <RadioGroup
            sx={{ mb: 1 }}
            row
            value={selectedUnit?.unit ?? ""}
            onChange={onChangeUnit}
          >
            {selectedProperty?.units?.map((u) => (
              <FormControlLabel
                key={u.unit}
                value={u.unit}
                control={<Radio />}
                label={u.unit}
              />
            ))}
          </RadioGroup>
          <div style={{ display: "flex" }}>
            <TextField
              sx={{ marginRight: "10px" }}
              size="small"
              label="Min"
              value={min}
              onChange={(e) => setMin(e?.target?.value)}
              helperText={selectedUnit?.min}
              error={isNaN(Number(min))}
            />
            <TextField
              size="small"
              label="Max"
              value={max}
              onChange={(e) => setMax(e?.target?.value)}
              helperText={selectedUnit?.max}
              error={isNaN(Number(max))}
            />
          </div>
        </Box>
      )}

      {selectedProperty && (min || max) && (
        <Button
          sx={{ mt: 1 }}
          size="small"
          variant="outlined"
          onClick={handleAdd}
        >
          Add
        </Button>
      )}
    </Box>
  );
};

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertyFilters, setPropertyFilters] = useState([0]);
  const [selectedProperties, setSelectedProperties] = useState([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(convertTreeData(data?.categories || [])))
      .catch((err) => console.error(err));

    getProperties()
      .then((data) => setProperties(convertGroupedData(data?.properties || [])))
      .catch((err) => console.error(err));
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectedCategoriesChange = (event, ids) => {
    setSelectedCategories(ids);
  };

  const handleSelectedProperties = (prop) => {
    setSelectedProperties([...selectedProperties, prop]);
  };

  console.log(selectedProperties);

  return (
    <div className="search-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 3 }}>
        Search Materials
      </Typography>
      <Container sx={{ display: "flex" }}>
        <Box sx={{ marginRight: "15px" }}>
          {/* Material Name */}
          <Box>
            <Typography variant="h6" sx={{ m: "10px 0" }}>
              By Material Name
            </Typography>
            <TextField
              label="Material Name"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Box>

          {/* Material Categories */}
          <Box>
            <Typography variant="h6" sx={{ m: "10px 0" }}>
              By Categories
            </Typography>
            <RichTreeView
              multiSelect
              checkboxSelection
              items={categories}
              selectedItems={selectedCategories}
              onSelectedItemsChange={handleSelectedCategoriesChange}
            />
          </Box>

          {/* Material Properties */}
          <Box>
            <Typography variant="h6" sx={{ m: "10px 0" }}>
              By Properties
            </Typography>
            {propertyFilters.map((id) => (
              <PropertyFilterItem
                key={id}
                properties={properties}
                onAdd={handleSelectedProperties}
              />
            ))}
            <Box
              sx={{
                m: "20px 0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  setPropertyFilters([
                    ...propertyFilters,
                    propertyFilters?.length + 1,
                  ])
                }
              >
                More Property
              </Button>
              <Button variant="contained" onClick>
                Search
              </Button>
            </Box>
          </Box>
        </Box>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <MaterialsTable
            searchTerm={searchTerm}
            searchCategories={selectedCategories?.join(",")}
          />
        </Box>
      </Container>
    </div>
  );
};

export default SearchPage;
