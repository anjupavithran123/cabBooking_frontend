import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import supabase from "../config/supabase";
import RateDriver from "../components/RateDriver";

export default function RiderStatus() {
  const { userId } = useAuth();

  const [ride, setRide] = useState(null);
  const [driver, setDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  const [driverAddress, setDriverAddress] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  /* ---------------- FETCH RIDE ---------------- */

  useEffect(() => {
    if (!userId) return;

    fetchActiveRide();

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
          console.log("Ride update:", payload.new);

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
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setRide(data);

      if (data.driver_id) {
        fetchDriverDetails(data.driver_id);
      }
    }
  };

  /* ---------------- DRIVER DETAILS ---------------- */

  const fetchDriverDetails = async (driverId) => {
    const { data, error } = await supabase
      .from("drivers")
      .select("name, phone, avatar_url, vehicle_type, vehicle_number")
      .eq("id", driverId)
      .single();

    if (!error) {
      setDriver(data);
    }
  };

  /* ---------------- DRIVER LIVE LOCATION ---------------- */

  useEffect(() => {
    if (!ride?.driver_id) return;

    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("current_lat, current_lng")
        .eq("id", ride.driver_id)
        .single();

      if (!error && data) {
        setDriverLocation({
          lat: data.current_lat,
          lng: data.current_lng,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [ride?.driver_id]);

  /* ---------------- DRIVER ADDRESS (NOMINATIM) ---------------- */

  useEffect(() => {
    if (!driverLocation) return;

    const fetchAddress = async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${driverLocation.lat}&lon=${driverLocation.lng}`
      );

      const data = await res.json();

      if (data?.display_name) {
        setDriverAddress(data.display_name);
      }
    };

    fetchAddress();
  }, [driverLocation]);

  /* ---------------- DISTANCE + ETA (OSRM) ---------------- */

  useEffect(() => {
    if (!driverLocation || !ride) return;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${ride.pickup_lng},${ride.pickup_lat}?overview=false`
        );

        const data = await res.json();

        if (data.routes?.length > 0) {
          const route = data.routes[0];

          const distanceKm = (route.distance / 1000).toFixed(2);
          const durationMin = Math.round(route.duration / 60);

          setDistance(distanceKm + " km");
          setEta(durationMin + " mins");
        }
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    };

    fetchRoute();
  }, [driverLocation, ride]);

  /* ---------------- STATUS COLOR ---------------- */

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

  if (!ride) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No active ride
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-6 rounded-xl shadow">

      <h2 className="text-2xl font-bold mb-4">
        Current Ride Status
      </h2>

      <p>
        <strong>Pickup:</strong> {ride.pickup_address}
      </p>

      <p>
        <strong>Drop:</strong> {ride.dropoff_address}
      </p>

      <p className="mt-3">
        <strong>Status:</strong>{" "}
        <span style={{ color: getColor(ride.status) }}>
          {ride.status.toUpperCase()}
        </span>
      </p>

      {/* ---------------- DRIVER DETAILS ---------------- */}

      {driver && ride.status !== "pending" && (
        <div className="mt-5 p-4 border rounded bg-gray-50">

          <h3 className="font-semibold mb-3">
            Driver Details
          </h3>

          <div className="flex gap-4 items-center">

            {driver.avatar_url && (
              <img
                src={driver.avatar_url}
                alt="driver"
                className="w-16 h-16 rounded-full object-cover"
              />
            )}

            <div>
              <p><strong>Name:</strong> {driver.name}</p>
              <p><strong>Phone:</strong> {driver.phone}</p>
              <p>
                <strong>Vehicle:</strong>{" "}
                {driver.vehicle_type} ({driver.vehicle_number})
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- DRIVER LOCATION ---------------- */}

      {driverLocation && (
        <div className="mt-5 p-4 border rounded bg-gray-50">

          <h3 className="font-semibold mb-2">
            Driver Live Location
          </h3>

          <p>
            <strong>Latitude:</strong> {driverLocation.lat}
          </p>

          <p>
            <strong>Longitude:</strong> {driverLocation.lng}
          </p>

          {driverAddress && (
            <p>
              <strong>Address:</strong> {driverAddress}
            </p>
          )}

          {distance && (
            <p>
              <strong>Distance:</strong> {distance}
            </p>
          )}

          {eta && (
            <p>
              <strong>ETA:</strong> {eta}
            </p>
          )}

        </div>
      )}

      {/* ---------------- RATING ---------------- */}

      {ride.status === "completed" && (
        <RateDriver
          rideId={ride.id}
          driverId={ride.driver_id}
        />
      )}

    </div>
  );
}