import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/driver`;
// 🔐 Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("driverToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ✅ Save / Update Bank Details
export const saveBankDetails = async (data) => {
  const response = await axios.post(
    `${API_BASE}/bank/bank-details`,
    data,
    getAuthHeader()
  );
  return response.data;
};

// ✅ Get Bank Details
export const getBankDetails = async () => {
  const response = await axios.get(
    `${API_BASE}/bank/bank-details`,
    getAuthHeader()
  );
  return response.data;
};