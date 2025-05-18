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
export const updateUserInfo = async (token, userId, updatedData) =>
  await axios.put(`${API_URL}/users/${userId}`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Reset a user's password (admin access required)
export const resetUserPassword = async (token, userId, newPassword) =>
  await axios.post(
    `${API_URL}/users/${userId}/reset-password`,
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

// Fetch bookmarked materials
export const getUserBookmarks = async (token) =>
  await axios
    .get(`${API_URL}/bookmarks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data);

// Add a material to bookmarks
export const toggleBookmark = async (matGUID) => {
  const token = localStorage.getItem("access_token");

  try {
    const response = await axios.post(
      `${API_URL}/bookmarks`,
      { matGUID },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching material:", error);
    throw error;
  }
};

// Get all bookmarked materials
export const getBookmarks = async () => {
  const token = localStorage.getItem("access_token");
  const response = await axios.get(`${API_URL}/bookmarks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getSettings = async () => {
  // Get the token from localStorage
  const token = localStorage.getItem("access_token");

  // Make sure the token exists before sending the request
  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.get(`${API_URL}/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

export const updateSettings = async ({ settings }) => {
  // Get the token from localStorage
  const token = localStorage.getItem("access_token");

  // Make sure the token exists before sending the request
  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.post(
      `${API_URL}/update-settings`,
      { settings },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};
