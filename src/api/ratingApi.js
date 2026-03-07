const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Submit rating
export const submitRating = async (ratingData) => {
  const res = await fetch(`${BASE_URL}/api/ratings/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ratingData),
  });

  if (!res.ok) {
    throw new Error("Failed to submit rating");
  }

  return res.json();
};

// Get driver rating
export const getDriverRating = async (driverId) => {
  const res = await fetch(`${BASE_URL}/api/ratings/driver/${driverId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch rating");
  }

  return res.json();
};