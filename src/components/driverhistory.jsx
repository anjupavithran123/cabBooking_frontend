import { useEffect, useState } from "react";
import supabase from "../config/supabase.js";

// Helper to format fare
const formatFare = (fare) => (fare != null ? `₹${fare.toFixed(2)}` : "N/A");

export default function DriverRideHistory() {
  const driverId = localStorage.getItem("driverId"); // ✅ stored driverId
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!driverId) return;

    const fetchRides = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("rides")
          .select("*")
          .eq("driver_id", driverId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setRides(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching driver ride history:", err);
        setError(err.message || "Failed to fetch rides");
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, [driverId]);

  if (!driverId) return <p>Driver not logged in.</p>;
  if (loading) return <p>Loading driver ride history...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (rides.length === 0) return <p>No ride history found.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Driver Ride History</h2>

      <ul className="space-y-3">
        {rides.map((ride) => (
          <li key={ride.id} className="border p-3 rounded bg-white shadow-sm">
            <p>
              <strong>Pickup:</strong> {ride.pickup_address || "Unknown"}
            </p>
            <p>
              <strong>Dropoff:</strong> {ride.dropoff_address || "Unknown"}
            </p>
            <p>
              <strong>Status:</strong> {ride.status || "Unknown"}
            </p>
            <p>
              <strong>Fare:</strong> {formatFare(ride.fare)}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {ride.created_at
                ? new Date(ride.created_at).toLocaleString()
                : "Unknown"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}