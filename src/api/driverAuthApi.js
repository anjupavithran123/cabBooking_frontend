import axios from "axios";

const API_BASE = "http://localhost:5000/api/driver/auth";

// Signup API
export const signupDriver = async (driverData) => {
  try {
    const res = await axios.post(`${API_BASE}/signup`, driverData);

    // Store driverId and stripe_account_id for later
    if (res.data?.driver?.id) {
      localStorage.setItem("driverId", res.data.driver.id);
      localStorage.setItem("stripeAccountId", res.data.driver.stripe_account_id);
    }

    return res.data;
  } catch (err) {
    console.error("Signup API error:", err.response?.data || err.message);
    throw err.response?.data || { message: "Signup failed" };
  }
};

// Login API
export const loginDriver = async (credentials) => {
  try {
    const res = await axios.post(`${API_BASE}/login`, credentials);

    console.log("Login response:", res.data);

    // Store UUID for future API calls
    localStorage.setItem("driverId", res.data.id);

    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
};

// ✅ Fetch Driver Profile

// ✅ Fetch Driver Profile (includes payment_per_km)
export const fetchDriverProfile = async () => {
  try {
    const driverId = localStorage.getItem("driverId");
    if (!driverId) throw { message: "Driver not logged in" };

    const res = await axios.get(`${API_BASE}/profile`, {
      params: { driver_id: driverId },
    });

    // Ensure payment_per_km is included
    return {
      ...res.data.driver,
      payment_per_km: res.data.driver.payment_per_km || 0,
    };
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch profile" };
  }
};

// ✅ Update Driver Profile (can include payment_per_km)
export const updateDriverProfile = async (profileData) => {
  try {
    const driverId = localStorage.getItem("driverId");
    if (!driverId) throw { message: "Driver not logged in" };

    const res = await axios.put(`${API_BASE}/profile`, {
      driver_id: driverId,
      ...profileData, // include payment_per_km here if present
    });

    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to update profile" };
  }
};