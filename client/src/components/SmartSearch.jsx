import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

import NavbarPrivate from "./NavbarPrivate";
import SmartSeachInfo from "./SmartSeachInfo";
import PremiumInfo from "./PremiumInfo";

import {
  vectorSearch,
  llmSearch,
  deepseekSearch,
  geminiSearch,
} from "../services/smart-search-service";

const MODELS = {
  VECTOR: "vector",
  LLM: "llm",
  DEEPSEEK: "deepseek",
  GEMINI: "gemini",
};

const LoadingCards = () =>
  Array.from({ length: 3 }, (_, i) => (
    <Card key={i} variant="outlined" sx={{ p: "15px 30px" }}>
      <Skeleton sx={{ borderRadius: 1, width: "80%" }} height={30} />
      <Skeleton variant="rectangular" sx={{ borderRadius: 1 }} height={60} />
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Skeleton width="30%" height={28} sx={{ borderRadius: 1 }} />
      </Box>
    </Card>
  ));

const FilterPropInfo = ({ material }) => {
  const {
    _id,
    matGUID: _matId,
    ["Material Name"]: _name,
    ["Material Notes"]: _notes,
    ["Key Words"]: _keywords,
    material: _m,
    Vendors,
    Properties,
    parsed_properties: _props,
    Categories,
    ...rest
  } = material;

  return Object.entries(rest || {}).map(([key, value]) => (
    <Typography
      key={key}
      variant="body2"
      sx={{ mt: 1, textAlign: "right", fontStyle: "italic", color: "#757575" }}
    >
      {key === "score" ? "Similarity Score" : key}:{" "}
      {typeof value === "object" && value !== null
        ? JSON.stringify(value, null, 2)
        : value ?? "-"}
    </Typography>
  ));
};

const SmartSearch = () => {
  const userRole = localStorage.getItem("user_role");
  const isAllowed = userRole === "admin" || userRole === "premium_user";

  const [isLoading, setLoading] = useState(false);
  const [model, setModel] = useState(MODELS.VECTOR);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [showEmptyErr, setShowEmptyErr] = useState(false);
  const [showCards, setShowCards] = useState(true); // Default to true to show the cards when there's no input
  const [isSearched, setIsSearched] = useState(false);

  const isVectorSearch = model === MODELS.VECTOR;

  const handleSearch = async () => {
    if (!query) return setSearchResult([]);
    setLoading(true);
    try {
      if (model === MODELS.VECTOR) {
        const response = await vectorSearch(query, limit, skip);
        setSearchResult(
          response?.data?.map((i) => ({ ...(i ?? {}), ...(i?.material ?? {}) }))
        );
      } else if (model === MODELS.LLM) {
        const response = await llmSearch(query);
        setSearchResult(response?.data?.result || []);
      } else if (model === MODELS.DEEPSEEK) {
        const response = await deepseekSearch(query);
        setSearchResult(response?.data?.result || []);
      } else if (model === MODELS.GEMINI) {
        const response = await geminiSearch(query);
        setSearchResult(response?.data?.result || []);
      }
    } catch (e) {
      console.log(e);
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
    setIsSearched(true);
  };

  const onSearch = () => {
    if (!query) {
      // Show error messages
      return setShowEmptyErr(true);
    }
    handleSearch();
  };

  const onChangeQuery = (e) => {
    const newQuery = e?.target?.value;
    setQuery(newQuery);

    // Show cards only when input is empty
    if (newQuery === "") {
      setShowCards(true);
    } else {
      setShowCards(false);
    }

    setSkip(0); // reset skip when a new search is entered
    setIsSearched(false);
  };

  useEffect(() => {
    if (isAllowed && skip > 0) handleSearch();
  }, [skip]);

  return (
    <div className="smart-search-page-container">
      <NavbarPrivate />
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
        Smart Search Materials
      </Typography>
      <Container>
        {!isAllowed ? (
          <PremiumInfo />
        ) : (
          <>
            {/* Main Search Section */}
            <Box sx={{ display: "flex", justifySelf: "center", width: "70%" }}>
              <FormControl size="small" style={{ width: 160 }}>
                <InputLabel id="model-select-label">Search Mode</InputLabel>
                <Select
                  labelId="model-select-label"
                  label="Search Mode"
                  value={model}
                  onChange={(e) => setModel(e?.target?.value)}
                >
                  <MenuItem value={MODELS.VECTOR}>Vector Search</MenuItem>
                  <MenuItem value={MODELS.LLM}>OpenAI</MenuItem>
                  <MenuItem value={MODELS.DEEPSEEK}>DeepSeek</MenuItem>
                  <MenuItem value={MODELS.GEMINI}>Google Gemini</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Search Query"
                sx={{ m: "0 10px", flex: 1 }}
                placeholder="Enter what you want to search for here"
                variant="outlined"
                value={query}
                onChange={onChangeQuery}
                onKeyDown={(e) => {
                  if (e?.key === "Enter") {
                    onSearch();
                  }
                }}
                InputProps={{
                  endAdornment: query ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="clear search"
                        onClick={() => onChangeQuery({ target: { value: "" } })}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />

              <Button variant="contained" onClick={onSearch}>
                Search
              </Button>
            </Box>

            {!isLoading && !searchResult?.length && isSearched && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  mt: 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                We couldn’t find any matches. Try adjusting your search query.
              </Alert>
            )}

            {/* Add the card section here for premium/admin users */}
            {showCards && <SmartSeachInfo />}

            <Box px={6} display="flex" flexDirection="column" gap={2} mt={4}>
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
                    component={Link}
                    to={`/material/${material?.matGUID}`}
                  >
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {material?.["Material Name"] || material?._id}
                    </Typography>

                    {material?.["Categories"]?.length > 0 && (
                      <Typography variant="body1">
                        Categories: {material?.["Categories"]?.join(", ")}
                      </Typography>
                    )}

                    {material?.["Material Notes"] && (
                      <Typography variant="body1" noWrap>
                        Notes: {material?.["Material Notes"]}
                      </Typography>
                    )}

                    <FilterPropInfo material={material} />
                  </Card>
                ))
              )}
            </Box>
            {isVectorSearch && searchResult?.length > 0 && (
              <Box align="center" px={6} m={2}>
                <Button
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={skip <= 0 || isLoading}
                >
                  Prev
                </Button>
                <Button
                  onClick={() => setSkip(skip + limit)}
                  disabled={isLoading}
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        )}
        <br />
      </Container>

      {/* Snackbar to show error messages */}
      <Snackbar
        open={showEmptyErr}
        autoHideDuration={5000}
        onClose={() => setShowEmptyErr(false)}
        message="Please enter a search query."
      />
    </div>
  );
};
export default SmartSearch;
