import React, { useState, useEffect } from "react";
import {
  Typography,
  List,
  ListItem,
  Box,
  Checkbox,
  FormControlLabel,
  TextField,
  Container,
} from "@mui/material";

import { getCategories } from "../services/material-service";
import MaterialsTable from "./MaterialsTable";

// import "./styles/navbar.css";
// import "./styles/Home.css";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error(err));
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="search-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 3 }}>
        Search
      </Typography>
      <Container sx={{ display: "flex" }}>
        {/* Search Bar */}
        <Box sx={{ marginRight: "20px" }}>
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
            <List>
              {categories?.map((cat) => (
                <ListItem key={cat._id} button="true" sx={{ px: 2.5 }}>
                  <FormControlLabel
                    control={<Checkbox name={cat?.name} sx={{}} />}
                    label={cat?.name}
                  />
                </ListItem>
              ))}
            </List>
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
