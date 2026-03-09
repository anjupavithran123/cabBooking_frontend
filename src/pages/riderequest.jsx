import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RideMap from "../components/RideMap";
import LocationSearch from "../components/LocationSearch";
import supabase from "../config/supabase";
import { useAuth } from "@clerk/clerk-react";
import { Car, Crown, Bike, MapPin, Navigation, Info, ArrowRight, Loader2 } from "lucide-react";

const BASE_PAYMENT_PER_KM = 12;

const RIDE_OPTIONS = [
  { id: "auto", label: "Auto", icon: Bike, multiplier: 0.8, desc: "Quick & breezy" },
  { id: "economy", label: "Economy", icon: Car, multiplier: 1, desc: "Comfy daily rides" },
  { id: "premium", label: "Premium", icon: Crown, multiplier: 1.5, desc: "Luxury experience" },
];

export default function RequestRide() {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [rideType, setRideType] = useState("economy");
  const [distanceKm, setDistanceKm] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect location
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
          setPickup({ lat: 9.9312, lng: 76.2673, address: "Kochi, Kerala" });
        }
      );
    }
  }, [pickup]);

  // Fare Calculation
  useEffect(() => {
    if (!pickup || !dropoff) return;

    const distance = getDistanceFromLatLonInKm(
      pickup.lat, pickup.lng,
      dropoff.lat, dropoff.lng
    );

    setDistanceKm(distance.toFixed(2));
    const selectedOption = RIDE_OPTIONS.find(opt => opt.id === rideType);
    const fare = distance * BASE_PAYMENT_PER_KM * (selectedOption?.multiplier || 1);
    setEstimatedFare(fare.toFixed(2));
  }, [pickup, dropoff, rideType]);

  const handleRequest = async () => {
    if (!pickup || !dropoff) return alert("Please select both locations");
    
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("rides")
      .insert([{
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
      }])
      .select();

    if (error) {
      alert("Booking failed. Please try again.");
      setIsSubmitting(false);
    } else {
      navigate("/payment", { state: { rideId: data[0].id, amount: estimatedFare } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Side Panel: Booking Controls */}
      <div className="w-full lg:w-[450px] bg-white shadow-2xl z-10 flex flex-col h-screen overflow-y-auto border-r border-slate-100">
        <div className="p-6 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Where to?</h2>
            <p className="text-slate-500 text-sm">Request a ride in seconds</p>
          </div>

          {/* Location Inputs with Visual Connector */}
       {/* Location Inputs with Visual Connector */}
<div className="relative space-y-4">
  <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-slate-100 z-0" />
  
  {/* PICKUP: Must have the highest z-index */}
  <div className="flex items-start gap-4 relative z-[50]"> 
    <div className="mt-3 p-1.5 bg-emerald-100 text-emerald-600 rounded-full">
      <MapPin size={16} fill="currentColor" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Pickup</p>
      <LocationSearch
        placeholder="Starting point..."
        setLocation={setPickup}
        defaultLocation={pickup}
      />
    </div>
  </div>

  {/* DROPOFF: Lower z-index than pickup */}
  <div className="flex items-start gap-4 relative z-[40]">
    <div className="mt-3 p-1.5 bg-rose-100 text-rose-600 rounded-full">
      <Navigation size={16} fill="currentColor" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Destination</p>
      <LocationSearch
        placeholder="Enter dropoff..."
        setLocation={setDropoff}
      />
    </div>
  </div>
</div>

          {/* Ride Option Selectors */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select Ride</h3>
            <div className="grid grid-cols-1 gap-3">
              {RIDE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setRideType(option.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    rideType === option.id 
                    ? "border-blue-600 bg-blue-50/50 shadow-sm" 
                    : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${rideType === option.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <option.icon size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{option.label}</p>
                      <p className="text-xs text-slate-500">{option.desc}</p>
                    </div>
                  </div>
                  {distanceKm && (
                    <div className="text-right">
                      <p className="font-black text-slate-900">₹{(distanceKm * BASE_PAYMENT_PER_KM * option.multiplier).toFixed(0)}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Call to Action */}
          {distanceKm && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl shadow-lg shadow-slate-200">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Info size={14} />
                    <span>{distanceKm} km trip</span>
                  </div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Fare</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white leading-none">₹{estimatedFare}</span>
                </div>
              </div>

              <button
                onClick={handleRequest}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Confirm Request
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Content: Fullscreen Map */}
      <div className="flex-1 relative h-[40vh] lg:h-screen">
        <RideMap
          pickup={pickup}
          dropoff={dropoff}
          setPickup={setPickup}
          setDropoff={setDropoff}
        />
        {/* Subtle Map Overlay for better contrast */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.03)]" />
      </div>
    </div>
  );
}

// Logic helpers (kept unchanged)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function deg2rad(deg) { return deg * (Math.PI / 180); }