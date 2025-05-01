import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Container,
  Select,
  MenuItem,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Card,
  Skeleton,
} from "@mui/material";

import NavbarPrivate from "./NavbarPrivate";

import { vectorSearch, llmSearch } from "../services/smart-search-service";

const LoadingCards = () =>
  Array.from({ length: 3 }, (_, i) => (
    <Skeleton
      key={i}
      variant="rectangular"
      sx={{ borderRadius: 1 }}
      height={118}
    />
  ));

const SmartSearch = () => {
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [model, setModel] = useState("vector");
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    if (model === "vector") {
      const response = await vectorSearch(query, limit, skip);
      setSearchResult(response.data);
    } else {
      const response = await llmSearch(query);
      const result = response.data.result
        .replace(/ObjectId\('([^']+)'\)/g, '"$1"')
        .replace(/'/g, '"');
      const arr = JSON.parse(result);
      setSearchResult(arr.map((obj) => ({ material: obj })));
    }
    setLoading(false);
  };

  const handleClick = (matID) => {
    navigate(`/material/${matID}`);
  };

  useEffect(() => {
    handleSearch();
  }, [skip]);

  return (
    <div className="smart-search-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
        Smart Search Materials
      </Typography>
      <Container>
        <Box sx={{ display: "flex", justifySelf: "center", width: "70%" }}>
          <FormControl size="small" style={{ width: 160 }}>
            <InputLabel id="model-select-label">Search Mode</InputLabel>
            <Select
              labelId="model-select-label"
              label="Search Mode"
              value={model}
              onChange={(e) => setModel(e?.target?.value)}
            >
              <MenuItem value="vector">Vector Search</MenuItem>
              <MenuItem value="llm">OpenAI</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter what you want to search for here"
            variant="outlined"
            sx={{ m: "0 10px", flex: 1 }}
          />

          <Button variant="contained" disabled={!query} onClick={handleSearch}>
            Search
          </Button>
        </Box>
        {searchResult?.result?.length > 0 && (
          <Box align="right" px={6} mt={1}>
            <Button
              onClick={() => setSkip(Math.max(0, skip - limit))}
              disabled={skip <= 0 || isLoading}
            >
              Prev
            </Button>
            <Button onClick={() => setSkip(skip + limit)} disabled={isLoading}>
              Next
            </Button>
          </Box>
        )}
        <Box px={6} display="flex" flexDirection="column" gap={2} mt={2}>
          {isLoading ? (
            <LoadingCards />
          ) : (
            searchResult.map((material, id) => (
              <Card
                key={id}
                variant="outlined"
                sx={{
                  p: "15px 30px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f5fbff",
                    borderColor: "#424242",
                  },
                }}
                onClick={() => handleClick(material.material.matGUID)}
              >
                <Typography variant="h6" noWrap sx={{ fontWeight: 600, mb: 1 }}>
                  {material?.material["Material Name"]}
                </Typography>

                <Typography variant="body1">
                  Categories: {material?.material["Categories"]?.join(", ")}
                </Typography>

                <Typography variant="body1" noWrap>
                  Notes: {material?.material["Material Notes"]}
                </Typography>

                {material?.score && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      textAlign: "right",
                      fontStyle: "italic",
                      color: "#757575",
                    }}
                  >
                    Similarity Score: {material.score}
                  </Typography>
                )}
              </Card>
            ))
          )}
        </Box>
        <br />
      </Container>
    </div>
  );
};

export default SmartSearch;
