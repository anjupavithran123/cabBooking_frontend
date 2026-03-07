import { useEffect, useState } from "react";
import {
  fetchNearbyRides,
  acceptRide,
  updateDriverLocation,
  completeRide,
} from "../api/driverapi";
import RideMap from "../components/RideMap";

export default function DriverDashboard() {
  const driverId = localStorage.getItem("driverId");

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [pendingRides, setPendingRides] = useState([]);
  const [acceptedRide, setAcceptedRide] = useState(null); // separate state
  const [loadingRides, setLoadingRides] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [online, setOnline] = useState(true);

  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  // =============================
  // Driver GPS tracking
  // =============================
  useEffect(() => {
    if (!driverId || !online) return;
    if (manualLat && manualLng) return;
    if (!navigator.geolocation) return;

    let lastUpdate = 0;

    const watchId = navigator.geolocation.watchPosition(async (pos) => {
      const now = Date.now();
      if (now - lastUpdate > 5000) {
        lastUpdate = now;

        const newLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setLocation(newLocation);
        await updateDriverLocation(driverId, newLocation.lat, newLocation.lng);
      }
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId, manualLat, manualLng, online]);

  // =============================
  // Fetch pending rides (auto refresh)
  // =============================
  useEffect(() => {
    if (!location.lat || !location.lng || !online) return;

    const loadRides = async () => {
      setLoadingRides(true);
      try {
        const nearbyRides = await fetchNearbyRides(
          location.lat,
          location.lng,
          driverId
        );

        const now = new Date();
        const filtered = nearbyRides.filter((ride) => {
          const rideTime = new Date(ride.created_at);
          const diffMinutes = (now - rideTime) / 60000;
          // only keep pending rides
          return ride.status === "pending" && diffMinutes <= 5;
        });

        setPendingRides(filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        console.error(err);
      }
      setLoadingRides(false);
    };

    loadRides();
    const interval = setInterval(loadRides, 8000);
    return () => clearInterval(interval);
  }, [location, online]);

  // =============================
  // Accept Ride
  // =============================
  const handleAcceptRide = async (rideId) => {
    if (acceptedRide) {
      alert("Complete current ride first");
      return;
    }

    setAccepting(true);
    try {
      await acceptRide(rideId, driverId);
      const ride = pendingRides.find((r) => r.id === rideId);
      if (ride) {
        setAcceptedRide({ ...ride, status: "accepted", driver_id: driverId });
        setPendingRides((prev) => prev.filter((r) => r.id !== rideId));
      }
    } catch (err) {
      alert("Failed to accept ride");
    }
    setAccepting(false);
  };

  // =============================
  // Complete Ride
  // =============================
  const handleCompleteRide = async (rideId) => {
    try {
      await completeRide(rideId);
      setAcceptedRide(null);
      alert("Ride Completed 🚕");
    } catch (err) {
      alert("Failed to complete ride");
    }
  };

  // =============================
  // Manual Location
  // =============================
  const setManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      const newLocation = { lat, lng };
      setLocation(newLocation);
      updateDriverLocation(driverId, lat, lng);
    } else {
      alert("Enter valid coordinates");
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Driver Dashboard</h2>

      {/* Online Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setOnline(!online)}
          className={`px-5 py-2 rounded-full text-white font-medium transition-colors duration-200 ${
            online ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {online ? "Online" : "Offline"}
        </button>
      </div>

      {/* Manual Location */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <input
          type="number"
          placeholder="Latitude"
          value={manualLat}
          onChange={(e) => setManualLat(e.target.value)}
          className="border p-2 rounded w-32"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={manualLng}
          onChange={(e) => setManualLng(e.target.value)}
          className="border p-2 rounded w-32"
        />
        <button
          onClick={setManualLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Set Location
        </button>
      </div>

      {/* Accepted Ride */}
      {acceptedRide && (
        <div className="bg-green-50 border border-green-300 p-4 rounded-lg mb-6 shadow-md">
          <h3 className="font-bold text-xl mb-3 text-green-800">Current Ride</h3>
          <p><b>Pickup:</b> {acceptedRide.pickup_address}</p>
          <p><b>Drop:</b> {acceptedRide.dropoff_address}</p>
          <p><b>Ride Type:</b> {acceptedRide.ride_type}</p>
          <button
            onClick={() => handleCompleteRide(acceptedRide.id)}
            className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Complete Ride
          </button>
        </div>
      )}

      {/* Pending Rides */}
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">Nearby Ride Requests</h3>
      {loadingRides ? (
        <p className="text-gray-500">Searching rides...</p>
      ) : pendingRides.length === 0 ? (
        <p className="text-gray-500">No nearby ride requests</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {pendingRides.map((ride) => (
            <div key={ride.id} className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition-shadow">
              <p><b>Pickup:</b> {ride.pickup_address}</p>
              <p><b>Drop:</b> {ride.dropoff_address}</p>
              <p><b>Ride Type:</b> {ride.ride_type}</p>
              <button
                onClick={() => handleAcceptRide(ride.id)}
                disabled={accepting}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full"
              >
                {accepting ? "Accepting..." : "Accept Ride"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      {location.lat && (
        <div className="mt-8 rounded-lg overflow-hidden shadow-md">
          <RideMap rides={acceptedRide ? [acceptedRide] : pendingRides} driverLocation={location} />
        </div>
      )}
    </div>
  );
}