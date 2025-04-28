import axios from "axios"

const API_URL = "/api";

export const getMaterialDetail = async (matID, setMaterial) => {
    const token = localStorage.getItem("access_token");
    axios.get(`${API_URL}/material/detail/${matID}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
      })
      .then(response => setMaterial(response.data.material))
}