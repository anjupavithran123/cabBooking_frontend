import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import supabase from "../config/supabase";

export default function RiderStatus() {
  const { userId } = useAuth();
  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    if (!userId) return;

    fetchActiveRide();

    // 🔥 Realtime listener for ride updates
    const channel = supabase
      .channel("rider-status-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rides",
          filter: `rider_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Live update received:", payload.new);
          setRide(payload.new);

          if (payload.new.driver_id) {
            fetchDriverDetails(payload.new.driver_id);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  const fetchActiveRide = async () => {
    const { data, error } = await supabase
      .from("rides")
      .select("*")
      .eq("rider_id", userId)
      .in("status", ["pending", "accepted", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setRide(data);
      if (data.driver_id) fetchDriverDetails(data.driver_id);
    }
  };

  const fetchDriverDetails = async (driverId) => {
    const { data, error } = await supabase
      .from("drivers")
      .select("name, phone, avatar_url, vehicle_type, vehicle_number")
      .eq("id", driverId)
      .single();

    if (!error && data) {
      setDriver(data);
    }
  };

  const getColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "accepted":
        return "blue";
      case "in_progress":
        return "purple";
      case "completed":
        return "green";
      default:
        return "black";
    }
  };

  if (!ride) return <p>No active ride</p>;

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-lg">
      <h2 className="text-xl font-bold mb-4">Current Ride Status</h2>

      <p><strong>Pickup:</strong> {ride.pickup_address}</p>
      <p><strong>Drop:</strong> {ride.dropoff_address}</p>

      <p className="mt-3">
        <strong>Status:</strong>{" "}
        <span className="font-bold" style={{ color: getColor(ride.status) }}>
          {ride.status.toUpperCase()}
        </span>
      </p>

      {driver && ride.status !== "pending" && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <h3 className="font-bold mb-2">Driver Details</h3>
          <p><strong>Name:</strong> {driver.name}</p>
          <p><strong>Phone:</strong> {driver.phone}</p>
          <p><strong>Vehicle:</strong> {driver.vehicle_type} ({driver.vehicle_number})</p>
          {driver.avatar_url && (
            <img
              src={driver.avatar_url}
              alt="Driver Avatar"
              className="mt-2 w-24 h-24 rounded-full object-cover"
            />
          )}
        </div>
      )}
    </div>
  );
}