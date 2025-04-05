import axios from "axios";

const API_URL = "/api";

// Register user
export const registerUser = async (email, password, role) =>
  await axios.post(`${API_URL}/register`, {
    email,
    password,
    role,
  });

// Login user
export const loginUser = async (email, password) =>
  await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
