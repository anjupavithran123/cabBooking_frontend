const BASE_URL = "http://localhost:5000/api/rider";

// 🔹 Get Rider Profile
export const fetchProfile = async (getToken) => {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch profile");

  return await res.json();
};

// 🔹 Update Rider Profile
export const updateProfile = async (getToken, profile) => {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  if (!res.ok) throw new Error("Failed to update profile");

  return await res.json();
};

// 🔹 Get Ride History
export const fetchRides = async (getToken) => {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/rides`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch rides");

  return await res.json();
};

export const getEstimatedFare = async ({ driverId, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng }) => {
  const url = new URL(`${BASE_URL}/fare`);
  url.searchParams.append("driver_id", driverId);
  url.searchParams.append("pickup_lat", pickup_lat);
  url.searchParams.append("pickup_lng", pickup_lng);
  url.searchParams.append("dropoff_lat", dropoff_lat);
  url.searchParams.append("dropoff_lng", dropoff_lng);

  const res = await fetch(url.toString());

  if (!res.ok) throw new Error("Failed to fetch estimated fare");

  return await res.json(); // { distance, estimatedFare }
};