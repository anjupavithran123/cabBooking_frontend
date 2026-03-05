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
    <div className="container mt-4">
      <h2>Request Ride</h2>

      <LocationSearch
        placeholder="Pickup Location"
        setLocation={setPickup}
        defaultLocation={pickup}
      />

      <LocationSearch
        placeholder="Dropoff Location"
        setLocation={setDropoff}
      />

      {distanceKm && estimatedFare && (
        <div className="mt-2 p-2 border rounded">
          <p>Distance: {distanceKm} km</p>
          <p>Fare: ₹ {estimatedFare}</p>
        </div>
      )}

      <select
        className="form-select mt-2"
        value={rideType}
        onChange={(e) => setRideType(e.target.value)}
      >
        <option value="economy">Economy</option>
        <option value="premium">Premium</option>
        <option value="auto">Auto</option>
      </select>

      <button className="btn btn-primary mt-3" onClick={handleRequest}>
        Request Ride
      </button>

      <RideMap
        pickup={pickup}
        dropoff={dropoff}
        setPickup={setPickup}
        setDropoff={setDropoff}
      />
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