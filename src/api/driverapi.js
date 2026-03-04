import axios from "axios";

// Set your backend base URL
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/driver`;
/**
 * Fetch nearby rides based on driver's location
 * @param {number} lat - Driver's latitude
 * @param {number} lng - Driver's longitude
 * @param {number} maxDistance - Maximum distance in km
 * @returns {Promise<Array>} - Array of rides
 */
export const fetchNearbyRides = async (
  lat,
  lng,
  driverId,
  maxDistance = 100
) => {
  try {
    if (!lat || !lng || !driverId) {
      console.warn("Missing lat, lng, or driverId");
      return [];
    }

    const res = await axios.get(`${BASE_URL}/rides/nearby`, {
      params: {
        driver_lat: lat,
        driver_lng: lng,
        driver_id: driverId,   // 🔥 required
        max_distance_km: maxDistance,
      },
    });

    if (!res.data || !Array.isArray(res.data.rides)) {
      console.warn("No rides array in response, returning empty array");
      return [];
    }

    return res.data.rides;
  } catch (err) {
    console.error(
      "Error fetching nearby rides:",
      err.response?.data || err.message
    );
    return [];
  }
};
/**
 * Accept a ride
 * @param {string} rideId - Ride ID to accept
 * @param {string} driverId - Driver ID
 * @returns {Promise<Object>} - Updated ride object
 */
export const acceptRide = async (rideId, driverId) => {
  try {
    const res = await axios.post(`${BASE_URL}/rides/accept`, {
      ride_id: rideId,
      driver_id: driverId,
    });

    console.log("API RESPONSE:", res.data); // 👈 ADD THIS

    return res.data; // temporarily return full response
  } catch (err) {
    console.error("Error accepting ride:", err.response?.data || err.message);
    throw err;
  }
};
export const updateDriverLocation = async (driverId, lat, lng) => {
  await axios.post(`${BASE_URL}/location/update`, {
    driver_id: driverId,
    lat,
    lng,
  });
};


