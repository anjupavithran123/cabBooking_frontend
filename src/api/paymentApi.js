import axios from "axios";

const API_BASE = "http://localhost:5000/api/payment";

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