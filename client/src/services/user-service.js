import axios from "axios";

const API_URL = "/api";

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

// Get current user profile
export const getUserProfile = async (token) =>
  await axios
    .get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);

// ✅ Get all users (admin only)
export const getAllUsers = async (token) =>
  await axios
    .get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);

// ✅ Update user info (admin only)
export const updateUserInfo = async (token, email, updatedData) =>
  await axios.put(`${API_URL}/users/${email}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// ✅ Reset user password (admin only)
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

// ✅ Delete a user (admin only)
export const deleteUser = async (token, email) =>
  await axios.delete(`${API_URL}/users/${email}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
