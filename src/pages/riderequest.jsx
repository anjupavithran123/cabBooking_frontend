import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RideMap from "../components/RideMap";
import LocationSearch from "../components/LocationSearch";
import supabase from "../config/supabase";
import { useAuth } from "@clerk/clerk-react";

const BASE_PAYMENT_PER_KM = 12;

const RIDE_TYPE_MULTIPLIER = {
  economy: 1,
  premium: 1.5,
  auto: 0.8
};

export default function RequestRide() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [rideType, setRideType] = useState("economy");
  const [distanceKm, setDistanceKm] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(null);

  useEffect(() => {
    if (!pickup && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickup({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: "Current Location"
          });
        },
        () => {
          setPickup({
            lat: 9.9312,
            lng: 76.2673,
            address: "Kochi fallback"
          });
        }
      );
    }
  }, [pickup]);

  useEffect(() => {
    if (!pickup || !dropoff) return;

    const distance = getDistanceFromLatLonInKm(
      pickup.lat,
      pickup.lng,
      dropoff.lat,
      dropoff.lng
    );

    setDistanceKm(distance.toFixed(2));

    const fare =
      distance *
      BASE_PAYMENT_PER_KM *
      (RIDE_TYPE_MULTIPLIER[rideType] || 1);

    setEstimatedFare(fare.toFixed(2));
  }, [pickup, dropoff, rideType]);

  const handleRequest = async () => {
    if (!pickup || !dropoff) {
      alert("Select pickup and dropoff");
      return;
    }

    const { data, error } = await supabase
      .from("rides")
      .insert([
        {
          rider_id: userId,
          pickup_address: pickup.address,
          dropoff_address: dropoff.address,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          dropoff_lat: dropoff.lat,
          dropoff_lng: dropoff.lng,
          ride_type: rideType,
          status: "pending",
          estimated_distance_km: distanceKm,
          estimated_fare: estimatedFare
        }
      ])
      .select();

    if (error) {
      alert("Error booking ride");
      console.log(error);
    } else {
      const rideId = data[0].id;

      navigate("/payment", {
        state: {
          rideId,
          amount: estimatedFare
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Request a Ride
        </h2>

        {/* Location Inputs */}
        <div className="space-y-3">
          <LocationSearch
            placeholder="Pickup Location"
            setLocation={setPickup}
            defaultLocation={pickup}
          />

          <LocationSearch
            placeholder="Dropoff Location"
            setLocation={setDropoff}
          />
        </div>

        {/* Fare Info */}
        {distanceKm && estimatedFare && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between">
            <div>
              <p className="text-gray-600 text-sm">Distance</p>
              <p className="font-semibold">{distanceKm} km</p>
            </div>

            <div>
              <p className="text-gray-600 text-sm">Estimated Fare</p>
              <p className="font-semibold text-green-600">
                ₹ {estimatedFare}
              </p>
            </div>
          </div>
        )}

     {/* Ride Type */}
<div className="mt-5">
  <p className="font-medium mb-2 text-gray-700">Select Ride Type</p>

  <div className="flex gap-6">

    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value="economy"
        checked={rideType === "economy"}
        onChange={(e) => setRideType(e.target.value)}
        className="accent-blue-600"
      />
      <span className="text-gray-700">Economy</span>
    </label>

    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value="premium"
        checked={rideType === "premium"}
        onChange={(e) => setRideType(e.target.value)}
        className="accent-blue-600"
      />
      <span className="text-gray-700">Premium</span>
    </label>

    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value="auto"
        checked={rideType === "auto"}
        onChange={(e) => setRideType(e.target.value)}
        className="accent-blue-600"
      />
      <span className="text-gray-700">Auto</span>
    </label>

  </div>
</div>

{/* Request Button */}
<div className="mt-6 flex justify-center">
  <button
    onClick={handleRequest}
    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition"
  >
    Request Ride
  </button>
</div>

        {/* Map */}
        <div className="mt-6 rounded-lg overflow-hidden border">
          <RideMap
            pickup={pickup}
            dropoff={dropoff}
            setPickup={setPickup}
            setDropoff={setDropoff}
          />
        </div>

      </div>
    </div>
  );
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}