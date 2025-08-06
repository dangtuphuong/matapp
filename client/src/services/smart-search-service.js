import axios from "axios";

const API_URL = "/api";

export const vectorSearch = async (query, limit, skip) => {
  const token = localStorage.getItem("access_token");
  return await axios.post(
    `${API_URL}/vector_search`,
    { query, limit, skip },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const openaiSearch = async (query) => {
  const token = localStorage.getItem("access_token");
  return await axios.post(
    `${API_URL}/openai_search`,
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
