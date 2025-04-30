import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Container,
} from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import { getCategories } from "../services/material-service";
import NavbarPrivate from "./NavbarPrivate";
import MaterialsTable from "./MaterialsTable";

const convertTreeData = (data) =>
  data?.map(({ name, children }) => ({
    id: name,
    label: name,
    ...(children && { children: convertTreeData(children) }),
  }));

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(convertTreeData(data?.categories || [])))
      .catch((err) => console.error(err));
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  console.log(selectedCategories);

  const handleSelectedCategoriesChange = (event, ids) => {
    setSelectedCategories(ids);
  };

  return (
    <div className="search-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 3 }}>
        Search Materials
      </Typography>
      <Container sx={{ display: "flex" }}>
        {/* Search Bar */}
        <Box sx={{ marginRight: "15px" }}>
          <Box>
            <TextField
              label="Search Materials"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Box>

          {/* Material Type Filter */}
          <Box>
            <RichTreeView
              multiSelect
              checkboxSelection
              items={categories}
              selectedItems={selectedCategories}
              onSelectedItemsChange={handleSelectedCategoriesChange}
            />
          </Box>
        </Box>
        <Box component="main" sx={{ flexGrow: 1 }}>
          <MaterialsTable searchTerm={searchTerm} />
        </Box>
      </Container>
    </div>
  );
};

export default SearchPage;
