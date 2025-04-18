import axios from "axios";

const API_URL = "/api";

// Register a new user
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

// Login an existing user
export const loginUser = async ({ email, password }) =>
  await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

// Fetch the currently logged-in user's profile
export const getUserProfile = async (token) =>
  await axios
    .get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);

// Get all users (admin access required)
export const getAllUsers = async (token) =>
  await axios
    .get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);

// Update a user's info (admin access required)
export const updateUserInfo = async (token, email, updatedData) =>
  await axios.put(`${API_URL}/users/${email}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Reset a user's password (admin access required)
export const resetUserPassword = async (token, email, newPassword) =>
  await axios.put(
    `${API_URL}/users/${email}/password`,
    { newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

// Delete a user by email (admin access required)
export const deleteUser = async (token, email) =>
  await axios.delete(`${API_URL}/users/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
