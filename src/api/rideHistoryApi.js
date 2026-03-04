import axios from "axios"; // ✅ ADD THIS

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/rides`;
// Rider ride history
export const fetchRiderRideHistory = async (riderId) => {
  try {
    const res = await axios.get(`${BASE_URL}/rider/${riderId}`);
    return res.data.rides; // make sure backend returns { rides: [...] }
  } catch (error) {
    console.error("Error fetching rider ride history:", error);
    throw error; // rethrow so frontend can catch it
  }
};
export const fetchDriverRideHistory = async (driverId, statusFilter = null) => {
    try {
      const res = await fetch(`${API_BASE}/driver/${driverId}`);
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
  
      const data = await res.json();
  
      // Make sure we have an array
      let rides = Array.isArray(data.rides) ? data.rides : [];
  
      // Optional: filter by status
      if (statusFilter) {
        rides = rides.filter(ride => ride.ride_status === statusFilter);
      }
  
      return rides;
    } catch (err) {
      console.error("Error fetching driver ride history:", err);
      return []; // return empty array on error
    }
  };