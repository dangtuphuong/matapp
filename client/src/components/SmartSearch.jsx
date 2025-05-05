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
  Snackbar,
  Alert,
} from "@mui/material";

import NavbarPrivate from "./NavbarPrivate";
import SubscriptionPage from "./SubscriptionPage";

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

const SmartSearch = () => {
  const navigate = useNavigate();

  const userRole = localStorage.getItem("user_role");
  const isAllowed = userRole === "admin" || userRole === "premium_user";

  const [isLoading, setLoading] = useState(false);
  const [model, setModel] = useState(MODELS.VECTOR);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [showEmptyErr, setShowEmptyErr] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [showCards, setShowCards] = useState(true); // Default to true to show the cards when there's no input

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const hasPagination = model === MODELS.VECTOR;

  const handleSearch = async () => {
    if (!query) return setSearchResult([]);
    setLoading(true);
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
    setLoading(false);
  };

  const onSearch = () => {
    if (!query) {
      // Show error messages
      return setShowEmptyErr(true);
    }
    handleSearch();
  };

  const handleClick = (matID) => {
    navigate(`/material/${matID}`);
  };

  const onChangeQuery = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Show cards only when input is empty
    if (newQuery === "") {
      setShowCards(true);
    } else {
      setShowCards(false);
    }

    setSkip(0); // reset skip when a new search is entered
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
          <Box mt={4} px={4}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              This feature is only accessible to premium users. Please contact
              us to subscribe.
            </Alert>

            <Typography variant="h5" gutterBottom>
              🔓 Unlock Premium Search Features
            </Typography>
            <Typography variant="body1" gutterBottom>
              Premium users gain access to intelligent search technologies that
              supercharge material discovery. Here's what you’re missing:
            </Typography>

            {/* Conditionally render the cards if input is not submitted */}
            {showCards && (
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))"
                gap={3}
                mt={3}
              >
                {/* VECTOR Search */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6">📦 Vector Search</Typography>
                  <Typography variant="body2" mt={1}>
                    Find similar materials using advanced embeddings. Perfect
                    for exploring alternatives based on your current choice.
                  </Typography>
                </Card>

                {/* LLM Search */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6">🤖 OpenAI LLM Search</Typography>
                  <Typography variant="body2" mt={1}>
                    Ask anything in natural language and get materials
                    recommended by an intelligent assistant.
                  </Typography>
                </Card>

                {/* DeepSeek */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6">🔍 DeepSeek</Typography>
                  <Typography variant="body2" mt={1}>
                    An advanced language model trained for deep technical
                    understanding of material properties and use cases.
                  </Typography>
                </Card>

                {/* Gemini */}
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6">🌟 Google Gemini</Typography>
                  <Typography variant="body2" mt={1}>
                    Explore materials with a Google-powered assistant that
                    explains properties, differences, and ideal applications.
                  </Typography>
                </Card>
              </Box>
            )}

            <Box textAlign="center" mt={4}>
              <SubscriptionPage
                open={openModal}
                handleClose={handleCloseModal}
              />
            </Box>
          </Box>
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
              />

              <Button variant="contained" onClick={onSearch}>
                Search
              </Button>
            </Box>
            {/* Add the card section here for premium/admin users */}
            {showCards && (
              <>
                <Typography variant="h6" px={6} mt={4}>
                  Explore Smart Search Tools
                </Typography>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                  gap={3}
                  mt={2}
                  px={6}
                >
                  {[
                    {
                      title: "📦 Vector Search",
                      desc: "Find similar materials using advanced embeddings. Perfect for exploring alternatives based on your current choice.",
                      details:
                        "Vector Search uses mathematical representations of materials, called embeddings. These embeddings capture the underlying features and relationships of materials, allowing the system to compare and find similar items based on their properties.",
                    },
                    {
                      title: "🤖 OpenAI LLM Search",
                      desc: "Ask anything in natural language and get materials recommended by an intelligent assistant.",
                      details:
                        "OpenAI LLM utilizes AI trained on vast datasets to understand natural language queries. It processes your request and provides the most relevant materials based on context, answering in an intuitive and human-like manner.",
                    },
                    {
                      title: "🔍 DeepSeek",
                      desc: "An advanced language model trained for deep technical understanding of material properties and use cases.",
                      details:
                        "DeepSeek leverages a specialized language model to deeply analyze technical material properties. It provides precise search results by understanding intricate details and nuances about materials, offering insightful recommendations.",
                    },
                    {
                      title: "🌟 Google Gemini",
                      desc: "Explore materials with a Google-powered assistant that explains properties, differences, and ideal applications.",
                      details:
                        "Google Gemini uses advanced machine learning algorithms developed by Google. It helps identify and explain material properties, differences, and ideal use cases by utilizing the vast knowledge base and AI capabilities of Google’s technologies.",
                    },
                  ].map((tool, idx) => (
                    <Card key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="h6">{tool.title}</Typography>
                      <Typography variant="body2" mt={1}>
                        {tool.desc}
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        <strong>How it works:</strong> {tool.details}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              </>
            )}
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
                    onClick={() => handleClick(material?.matGUID)}
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
            {hasPagination && searchResult?.length > 0 && (
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
