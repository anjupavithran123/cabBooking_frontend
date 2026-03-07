import { useEffect, useState } from "react";
import supabase from "../config/supabase.js";

const formatFare = (fare) => (fare != null ? `₹${fare.toFixed(2)}` : "N/A");

export default function DriverRideHistory() {
  const driverId = localStorage.getItem("driverId");
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

  const getStatusColor = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    if (status === "ongoing") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  if (!driverId)
    return (
      <div className="p-6 text-center text-gray-600">
        Driver not logged in.
      </div>
    );

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Loading ride history...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-red-600 font-medium">
        {error}
      </div>
    );

  if (rides.length === 0)
    return (
      <div className="p-6 text-center text-gray-500">
        No ride history found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🚖 Driver Ride History
      </h2>

      <div className="space-y-4">
        {rides.map((ride) => (
          <div
            key={ride.id}
            className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition"
          >
            {/* Status + Fare */}
            <div className="flex justify-between items-center mb-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  ride.status
                )}`}
              >
                {ride.status || "Unknown"}
              </span>
{/* 
              <span className="text-lg font-bold text-gray-800">
                {formatFare(ride.fare)}
              </span> */}
            </div>

            {/* Pickup */}
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-600 font-bold">●</span>
              <p>{ride.pickup_address || "Unknown pickup location"}</p>
            </div>

            {/* Dropoff */}
            <div className="flex items-start gap-2 text-sm text-gray-700 mt-1">
              <span className="text-red-500 font-bold">●</span>
              <p>{ride.dropoff_address || "Unknown dropoff location"}</p>
            </div>

            {/* Date */}
            <div className="text-xs text-gray-500 mt-3">
              {ride.created_at
                ? new Date(ride.created_at).toLocaleString()
                : "Unknown date"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}