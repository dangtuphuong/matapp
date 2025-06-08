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

import SmartSeachInfo from "./SmartSeachInfo";
import PremiumInfo from "./PremiumInfo";

import {
  vectorSearch,
  llmSearch,
  deepseekSearch,
  geminiSearch,
} from "../services/smart-search-service";
import { getSettings } from "../services/user-service";
import { MODELS, MODELS_LABELS } from "../constants";

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
  const userRole = localStorage.getItem("user_role") || "premium_user";
  const isAllowed = userRole === "admin" || userRole === "premium_user";

  const [isLoading, setLoading] = useState(false);
  const [options, setOptions] = useState([MODELS.VECTOR]);
  const [model, setModel] = useState(MODELS.VECTOR);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [showEmptyErr, setShowEmptyErr] = useState(false);
  const [showCards, setShowCards] = useState(true); // Default to true to show the cards when there's no input
  const [isSearched, setIsSearched] = useState(false);
  const [resErr, setResErr] = useState(null);

  const isVectorSearch = model === MODELS.VECTOR;

  useEffect(() => {
    getSettings()
      .then((data) => {
        const result = Object.keys(data?.settings?.smart_search).filter(
          (key) => data?.settings?.smart_search[key]
        );
        setOptions(result);
        setModel(result[0] ?? "");
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = async () => {
    if (!query) return setSearchResult([]);
    setLoading(true);
    setResErr(null);
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
      setResErr(e?.response?.data?.error);
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
      setSearchResult([]);
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
      <Typography align="center" variant="h4" sx={{ mt: 3, mb: 2 }}>
        Material Smart Search
      </Typography>

      <Container>
        {!isAllowed ? (
          <PremiumInfo />
        ) : (
          <>
            {/* Main Search Section */}
            <Box
              px={6}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                gap: { xs: 2, sm: 0 },
                mt: 3,
                mb: 3,
              }}
            >
              <FormControl size="small" sx={{ width: { xs: "100%", sm: 160 } }}>
                <InputLabel id="model-select-label">Search Mode</InputLabel>
                <Select
                  labelId="model-select-label"
                  label="Search Mode"
                  value={model}
                  onChange={(e) => setModel(e?.target?.value)}
                >
                  {options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {MODELS_LABELS[option]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Search Query"
                sx={{ m: "0 10px", flex: 1, width: { xs: "100%" } }}
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

              <Button
                disabled={isLoading}
                variant="contained"
                onClick={onSearch}
              >
                Search
              </Button>
            </Box>

            {!isLoading && !searchResult?.length && isSearched && (
              <Alert
                severity="error"
                px={6}
                sx={{
                  m: 6,
                  mb: 3,
                  mt: 3,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {resErr ??
                  "We couldn’t find any matches. Try adjusting your search query."}
              </Alert>
            )}

            {/* Add the card section here for premium/admin users */}
            {showCards && <SmartSeachInfo options={options} />}

            <Box px={6} display="flex" flexDirection="column" gap={2} mt={4}>
              {isLoading ? (
                <LoadingCards />
              ) : (
                searchResult.map((material, id) => (
                  <Card
                    key={id}
                    variant="outlined"
                    sx={{
                      p: {
                        xs: "12px 16px", // Mobile
                        sm: "14px 24px", // Tablet
                        md: "15px 30px", // Desktop
                      },
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "#f5fbff",
                        borderColor: "#424242",
                      },
                      fontSize: {
                        xs: "0.85rem", // Scale all text inside if not overridden
                        sm: "0.95rem",
                        md: "1rem",
                      },
                    }}
                    component={Link}
                    to={`/material/${material?.matGUID}`}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        wordBreak: "break-word",
                        fontSize: {
                          xs: "1rem", // very small screens
                          sm: "1.1rem", // ≥600px
                          md: "1.15rem", // ≥900px
                          lg: "1.2rem", // ≥1200px
                        },
                        "@media (max-width:1080px)": {
                          fontSize: "1rem",
                        },
                      }}
                    >
                      {material?.["Material Name"] || material?._id}
                    </Typography>

                    {material?.["Categories"]?.length > 0 && (
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: {
                            xs: "0.85rem",
                            sm: "0.9rem",
                            md: "0.95rem",
                            lg: "1rem",
                          },
                          "@media (max-width:1080px)": {
                            fontSize: "0.9rem",
                          },
                        }}
                      >
                        Categories: {material?.["Categories"]?.join(", ")}
                      </Typography>
                    )}

                    {material?.["Material Notes"] && (
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: {
                            xs: "0.85rem", // <600px
                            sm: "0.95rem", // ≥600px
                            md: "1rem", // ≥900px
                            lg: "1.05rem", // ≥1200px
                          },
                          "@media (max-width:1080px)": {
                            fontSize: "0.9rem", // scale down for <1080px
                          },
                        }}
                      >
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
