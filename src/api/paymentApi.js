import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/payment`;
export const createOrder = async (rideId) => {
  const res = await axios.post(
    `${API_BASE}/create-order`,
    { rideId }, // ✅ must match backend
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};