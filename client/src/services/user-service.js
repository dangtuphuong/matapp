import axios from "axios";

const API_URL = "/api"; // Leave this as-is; works with proxy setup during development

// Register user
export const registerUser = async ({
  firstName,
  lastName,
  dateOfBirth,
  gender,
  email,
  password,
  role,
}) =>
  await axios.post(`${API_URL}/register`, {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    email,
    password,
    role,
  });

// Login user
export const loginUser = async ({ email, password }) =>
  await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

// ✅ New: Get profile
export const getUserProfile = async (token) =>
  await axios
    .get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);
