import axios from "axios";

const API_URL = "/api";

export const getAllMaterials = async ({
  page,
  limit,
  searchTerm,
  searchCategories = [],
  searchProperties = [],
}) => {
  try {
    const response = await axios.post(
      `${API_URL}/materials`,
      {
        page,
        limit,
        searchTerm,
        searchCategories,
        searchProperties,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching materials:", error);
    throw error;
  }
};

export const getMaterialByMatGUID = async (matGUID) => {
  try {
    const response = await axios.get(`${API_URL}/materials/${matGUID}`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching material:", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getProperties = async () => {
  try {
    const response = await axios.get(`${API_URL}/properties`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

export const uploadMaterials = async (files) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("No access token found");
  }

  if (!files || files.length === 0) {
    throw new Error("No files selected for upload.");
  }

  const formData = new FormData();

  for (const file of files) {
    formData.append("materials", file);
  }

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading material:", error);
    throw error;
  }
};
