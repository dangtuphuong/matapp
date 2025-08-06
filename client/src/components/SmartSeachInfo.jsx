import { Typography, Box, Card } from "@mui/material";
import { MODELS } from "../constants";

const MODEL_CARDS = [
  {
    model: MODELS.VECTOR,
    title: "📦 Vector Search",
    desc: "Retrieve similar materials from the dataset using advanced material embeddings.",
    details:
      "Vector Search uses mathematical representations of materials, called embeddings. These embeddings capture the underlying features and relationships of materials, allowing the system to find similar items based on their properties.",
  },
  {
    model: MODELS.LLM,
    title: "🤖 LLM Search",
    desc: "Ask anything in natural language and get materials recommended by an intelligent assistant.",
    details:
      "Large Language Models use AI trained on vast datasets to understand natural language queries. It processes your request and provides the most relevant materials based on context without the need for complex filters.",
  },
];

const SmartSeachInfo = ({ options = [] }) => (
  <Box
    display="grid"
    gridTemplateColumns={{
      xs: "1fr",
      sm: options.length === 1 ? "1fr" : "1fr 1fr",
    }}
    gap={3}
    mt={4}
    sx={{ px: { xs: 2, sm: 6 } }}
  >
    {MODEL_CARDS.map((tool, idx) =>
      options.includes(tool?.model) ? (
        <Card
          key={idx}
          variant="outlined"
          sx={{
            p: options.length === 1 ? 3 : 2,
            bgcolor: "#f9f9f9",
            color: "#505050",
          }}
        >
          <Typography variant="h6">{tool.title}</Typography>
          <Typography variant="body2" mt={1}>
            {tool.desc}
          </Typography>
          <Typography variant="body2" mt={1}>
            <strong>How it works:</strong> {tool.details}
          </Typography>
        </Card>
      ) : null
    )}
  </Box>
);

export default SmartSeachInfo;
