import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { fetchRiderRideHistory } from "../api/rideHistoryApi";

export default function RideHistory() {
  const { userId } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRides = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await fetchRiderRideHistory(userId);
      setRides(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching ride history:", err);
      setError(err.message || "Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [userId]);

  if (loading) return <p className="text-center text-gray-500 mt-6">Loading ride history...</p>;
  if (error) return <p className="text-center text-red-600 mt-6">{error}</p>;
  if (rides.length === 0) return <p className="text-center text-gray-500 mt-6">No ride history found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Ride History</h2>

      <ul className="space-y-4">
        {rides.map((ride) => (
          <li
            key={ride.id}
            className="bg-white shadow-md rounded-lg p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div className="flex-1 space-y-1">
              <p className="text-gray-700"><span className="font-semibold">Pickup:</span> {ride.pickup || ride.pickup_address || "Unknown"}</p>
              <p className="text-gray-700"><span className="font-semibold">Dropoff:</span> {ride.dropoff || ride.dropoff_address || "Unknown"}</p>
              <p className="text-gray-700"><span className="font-semibold">Date:</span> {ride.created_at ? new Date(ride.created_at).toLocaleString() : "Unknown"}</p>
            </div>

            <div className="mt-3 md:mt-0">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  ride.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : ride.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {ride.status || ride.ride_status || "Pending"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}