import axios from "axios";

const API_URL = "/api";

export const getMaterialByMatGUID = async (matGUID) => {
  // Get the token from localStorage
  const token = localStorage.getItem("access_token");

  // Make sure the token exists before sending the request
  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.get(`${API_URL}/materials/${matGUID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching material:", error);
    throw error;
  }
};
