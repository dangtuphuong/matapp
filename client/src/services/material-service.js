import axios from "axios";

const API_URL = "/api";

export const getMaterialDetail = async (matID, setMaterial) => {
  const token = localStorage.getItem("access_token");
  axios
    .get(`${API_URL}/material/detail/${matID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => setMaterial(response.data.material));
};

export const getAllMaterials = async ({
  page,
  limit,
  searchTerm,
  searchCategories = [],
  searchProperties = [],
}) => {
  // Get the token from localStorage
  const token = localStorage.getItem("access_token");

  // Make sure the token exists before sending the request
  if (!token) {
    throw new Error("No access token found");
  }

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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching materials:", error);
    throw error;
  }
};

export const getMaterialByMatId = async (mat_id) => {
  // Get the token from localStorage
  const token = localStorage.getItem("access_token");

  // Make sure the token exists before sending the request
  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.get(`${API_URL}/materials/${mat_id}`, {
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

export const getCategories = async () => {
  // Get the token from localStorage
  const token = localStorage.getItem("access_token");

  // Make sure the token exists before sending the request
  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getProperties = async () => {
  // Get the token from localStorage
  const token = localStorage.getItem("access_token");

  // Make sure the token exists before sending the request
  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.get(`${API_URL}/properties`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
