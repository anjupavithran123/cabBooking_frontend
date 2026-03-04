import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { fetchNearbyRides, acceptRide ,updateDriverLocation} from "../api/driverapi";
import RideMap from "../components/RideMap";

export default function DriverDashboard() {
  const driverId = localStorage.getItem("driverId");

  console.log("DriverId:", driverId);

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [rides, setRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  // Get driver location automatically
  useEffect(() => {
    if (!driverId) return; // wait until driverId exists

    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    let lastUpdate = 0;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();

        if (now - lastUpdate > 5000) { // update every 5 sec
          lastUpdate = now;

          const newLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          console.log("Live driver location:", newLocation);

          setLocation(newLocation);

          // 🔥 PUT IT RIGHT HERE
          await updateDriverLocation(
            driverId,
            newLocation.lat,
            newLocation.lng
          );
        }
      },
      (err) => {
        console.error("Location error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);

  }, [driverId]); // important dependency

  


  // Fetch nearby rides whenever location changes
  useEffect(() => {
    const loadRides = async () => {
      if (!location.lat || !location.lng) return;
      setLoadingRides(true);
      try {
        const nearbyRides = await fetchNearbyRides(location.lat, location.lng,  driverId);
        console.log("Frontend received rides:", nearbyRides); // 👈 ADD THIS
        setRides(nearbyRides);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRides(false);
      }
    };
    loadRides();
  }, [location]);

  // Accept ride
  const handleAcceptRide = async (rideId) => {
    if (!rideId) return;
  
    setAccepting(true);
    try {
      const updatedRide = await acceptRide(rideId, driverId);
  
      // ✅ Update ride status instead of removing
      setRides((prevRides) =>
        prevRides.map((r) =>
          r.id === rideId
            ? { ...r, status: "accepted" } // or updatedRide.status if backend returns it
            : r
        )
      );
  
    } catch (err) {
      console.error("Failed to accept ride:", err);
      alert("Failed to accept ride");
    } finally {
      setAccepting(false);
    }
  };

  // Manual location fallback
  const setManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({ lat, lng });
      setGeoError(null);
    } else {
      alert("Enter valid coordinates");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Driver Dashboard</h2>

      {geoError && <p className="text-red-500 mb-2">{geoError}</p>}

      {/* Manual location input */}
      <div className="mb-4 flex gap-2 items-center">
        <input
          type="number"
          placeholder="Latitude"
          value={manualLat}
          onChange={(e) => setManualLat(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={manualLng}
          onChange={(e) => setManualLng(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={setManualLocation}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Set Location
        </button>
      </div>

      {loadingRides ? (
        <p>Loading nearby rides...</p>
      ) : rides.length === 0 ? (
        <p>No rides nearby.</p>
      ) : (
        <ul>
        {rides.map((ride) => (
          <li key={ride.id} className="mb-3 p-3 border rounded relative">
      
            {/* ✅ Status Badge */}
            {ride.status === "accepted" && (
              <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                Accepted
              </span>
            )}
      
            <p>
              <strong>Pickup:</strong> {ride.pickup_address} (
              {ride.pickup_lat?.toFixed(4)}, {ride.pickup_lng?.toFixed(4)})
            </p>
      
            <p>
              <strong>Dropoff:</strong> {ride.dropoff_address} (
              {ride.dropoff_lat?.toFixed(4)}, {ride.dropoff_lng?.toFixed(4)})
            </p>
      
            <p>
              <strong>Type:</strong> {ride.ride_type}
            </p>
      
            {/* ✅ Hide button if already accepted */}
            {ride.status !== "accepted" && (
              <button
                onClick={() => handleAcceptRide(ride.id)}
                disabled={accepting}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {accepting ? "Accepting..." : "Accept Ride"}
              </button>
            )}
          </li>
        ))}
      </ul>
      )}

      {/* Map */}
      {rides.length > 0 && <RideMap rides={rides} driverLocation={location} />}
    </div>
  );
}