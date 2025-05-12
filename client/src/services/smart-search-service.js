import axios from "axios";

const API_URL = "localhost:8000";

export const vectorSearch = async (query, limit, skip) => {
  const token = localStorage.getItem("access_token");
  return await axios.post(
    `${API_URL}/ML/vector_search`,
    { query, limit, skip },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const llmSearch = async (query, limit, skip) => {
  const token = localStorage.getItem("access_token");
  return await axios.post(
    `${API_URL}/ML/llm_search`,
    { query },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const deepseekSearch = async (query) => {
  const token = localStorage.getItem("access_token");
  return await axios.post(
    `${API_URL}/deepseek_search`,
    { query },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const geminiSearch = async (query) => {
  const token = localStorage.getItem("access_token");
  return await axios.post(
    `${API_URL}/gemini_search`,
    { query },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};
