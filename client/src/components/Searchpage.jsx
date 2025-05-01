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
  Divider,
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

const PropertyFilterItem = ({ id, properties, onChange }) => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [textVal, setTextVal] = useState("");

  const isTextValProp = selectedProperty?.group === "Descriptive Properties";

  const onChangeUnit = (e) => {
    const selectedUnit = selectedProperty?.units?.find(
      (u) => u.unit === e.target.value
    );
    setSelectedUnit(selectedUnit);
  };

  const onSelectProperty = (event, selectedOption) => {
    setSelectedProperty(selectedOption);
    setMin("");
    setMax("");
    setTextVal("");
    setSelectedUnit(null);
  };

  useEffect(() => {
    onChange({
      id,
      group: selectedProperty?.group,
      property: selectedProperty?.label,
      ...(min !== "" && { min: Number(min) }),
      ...(max !== "" && { max: Number(max) }),
      ...(isTextValProp && textVal !== "" && { text_value: textVal }),
      unit: selectedUnit?.unit,
    });
  }, [
    id,
    selectedProperty?.label,
    min,
    max,
    selectedUnit?.unit,
    textVal,
    isTextValProp,
  ]);

  return (
    <Box>
      <Autocomplete
        fullWidth
        size="small"
        options={properties}
        groupBy={(option) => option?.group}
        renderInput={(p) => <TextField {...p} label="Property" />}
        onChange={onSelectProperty}
      />

      {selectedProperty &&
        (isTextValProp ? (
          <Box sx={{ m: "10px 0" }}>
            <TextField
              fullWidth
              size="small"
              label="Descriptive Value"
              value={textVal}
              onChange={(e) => setTextVal(e?.target?.value)}
            />
          </Box>
        ) : (
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
        ))}
    </Box>
  );
};

const SearchPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([
    { id: Math.random().toString(36).substring(2, 10) },
  ]);
  const [searchParams, setSearchParams] = useState({
    searchCategories: [],
    searchProperties: [],
  });

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(convertTreeData(data?.categories || [])))
      .catch((err) => console.error(err));

    getProperties()
      .then((data) => setProperties(convertGroupedData(data?.properties || [])))
      .catch((err) => console.error(err));
  }, []);

  const handleSelectedCategoriesChange = (event, ids) => {
    setSelectedCategories(ids);
  };

  const handleSelectedProperties = (prop) => {
    const index = selectedProperties?.findIndex(
      (item) => item?.id === prop?.id
    );

    if (index !== -1) {
      const updatedProperties = [...selectedProperties];
      updatedProperties[index] = prop;
      setSelectedProperties(updatedProperties);
    }
  };

  const onUpdateSearchParams = () =>
    setSearchParams({
      searchCategories: selectedCategories,
      searchProperties: selectedProperties,
    });

  return (
    <div className="search-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
        Search Materials
      </Typography>
      <Container sx={{ display: "flex" }}>
        <Box sx={{ marginRight: "15px", width: "270px", minWidth: "270px" }}>
          {/* Material Categories */}
          <Box>
            <Typography variant="h6" sx={{ mb: "20px" }}>
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
          <Divider sx={{ m: "20px 0" }} />
          <Box>
            <Typography variant="h6" sx={{ m: "20px 0" }}>
              By Properties
            </Typography>
            <div>
              {selectedProperties?.map((item, index) => (
                <React.Fragment key={item?.id}>
                  <PropertyFilterItem
                    key={item?.id}
                    id={item?.id}
                    properties={properties}
                    onChange={handleSelectedProperties}
                  />
                  {index < selectedProperties.length - 1 && (
                    <Divider
                      sx={{ m: "20px 0", color: "#bdbdbd", fontSize: 12 }}
                    >
                      and
                    </Divider>
                  )}
                </React.Fragment>
              ))}
            </div>
            <Button
              sx={{ m: "10px 0" }}
              startIcon={<AddIcon />}
              onClick={() =>
                setSelectedProperties([
                  ...selectedProperties,
                  { id: Math.random().toString(36).substring(2, 10) },
                ])
              }
            >
              More Property
            </Button>
            <Box
              sx={{
                m: 2,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button variant="contained" onClick={onUpdateSearchParams}>
                Search
              </Button>
            </Box>
          </Box>
        </Box>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <MaterialsTable
            searchCategories={searchParams?.searchCategories}
            searchProperties={searchParams?.searchProperties}
          />
        </Box>
      </Container>
    </div>
  );
};

export default SearchPage;
