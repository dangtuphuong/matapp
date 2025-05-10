import { Typography, Box, Card } from "@mui/material";

const MODELS = [
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
];

const SmartSeachInfo = () => (
  <Box
    display="grid"
    gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
    gap={3}
    mt={4}
    sx={{ px: { xs: 2, sm: 6 } }}
  >
    {MODELS.map((tool, idx) => (
      <Card key={idx} variant="outlined" sx={{ p: 2, bgcolor: "#f9f9f9" }}>
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
);

export default SmartSeachInfo;
