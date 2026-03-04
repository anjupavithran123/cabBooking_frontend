import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { fetchRiderRideHistory } from "../api/rideHistoryApi";

export default function RideHistory() {
  const { userId } = useAuth(); // ✅ get current rider ID from Clerk
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRides = async () => {
    if (!userId) return; // safety check
    try {
      setLoading(true);
      const data = await fetchRiderRideHistory(userId);
      console.log("Rider rides response:", data); // 🔹 debug the API response
      // Make sure we always have an array
      setRides(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching rider ride history:", err);
      setError(err.message || "Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [userId]);

  if (loading) return <p>Loading ride history...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (rides.length === 0) return <p>No ride history found.</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ride History</h2>
      <ul className="space-y-2">
        {rides.map((ride) => (
          <li
            key={ride.id}
            className="p-3 bg-white rounded shadow-sm"
          >
            {/* Use safe rendering with fallback */}
            <p>
              <strong>Pickup:</strong> {ride.pickup || ride.pickup_address || "Unknown"}
            </p>
            <p>
              <strong>Dropoff:</strong> {ride.dropoff || ride.dropoff_address|| "Unknown"}
            </p>
            <p>
              <strong>Status:</strong> {ride.status || ride.ride_status || "Unknown"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}