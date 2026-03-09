import { useEffect, useState } from "react";
import {
  fetchNearbyRides,
  acceptRide,
  updateDriverLocation,
  completeRide,
} from "../api/driverapi";
import RideMap from "../components/RideMap";
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Wifi, 
  WifiOff, 
  Loader2, 
  Compass,
  CreditCard
} from "lucide-react";

export default function DriverDashboard() {
  const driverId = localStorage.getItem("driverId");

  const [location, setLocation] = useState({ lat: null, lng: null });
  const [pendingRides, setPendingRides] = useState([]);
  const [acceptedRide, setAcceptedRide] = useState(null);
  const [loadingRides, setLoadingRides] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [online, setOnline] = useState(true);

  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  // GPS Tracking Logic (Existing logic preserved)
  useEffect(() => {
    if (!driverId || !online) return;
    if (manualLat && manualLng) return;
    if (!navigator.geolocation) return;

    let lastUpdate = 0;
    const watchId = navigator.geolocation.watchPosition(async (pos) => {
      const now = Date.now();
      if (now - lastUpdate > 5000) {
        lastUpdate = now;
        const newLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(newLocation);
        await updateDriverLocation(driverId, newLocation.lat, newLocation.lng);
      }
    });
    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId, manualLat, manualLng, online]);

  // Fetch Rides Logic (Existing logic preserved)
  useEffect(() => {
    if (!location.lat || !location.lng || !online) return;
    const loadRides = async () => {
      setLoadingRides(true);
      try {
        const nearbyRides = await fetchNearbyRides(location.lat, location.lng, driverId);
        const now = new Date();
        const filtered = nearbyRides.filter((ride) => {
          const rideTime = new Date(ride.created_at);
          return ride.status === "pending" && (now - rideTime) / 60000 <= 5;
        });
        setPendingRides(filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) { console.error(err); }
      setLoadingRides(false);
    };
    loadRides();
    const interval = setInterval(loadRides, 8000);
    return () => clearInterval(interval);
  }, [location, online, driverId]);

  const handleAcceptRide = async (rideId) => {
    if (acceptedRide) return alert("Complete current ride first");
    setAccepting(true);
    try {
      await acceptRide(rideId, driverId);
      const ride = pendingRides.find((r) => r.id === rideId);
      if (ride) {
        setAcceptedRide({ ...ride, status: "accepted", driver_id: driverId });
        setPendingRides((prev) => prev.filter((r) => r.id !== rideId));
      }
    } catch (err) { alert("Failed to accept ride"); }
    setAccepting(false);
  };

  const handleCompleteRide = async (rideId) => {
    try {
      await completeRide(rideId);
      setAcceptedRide(null);
    } catch (err) { alert("Failed to complete ride"); }
  };

  const setManualLocation = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({ lat, lng });
      updateDriverLocation(driverId, lat, lng);
    } else { alert("Enter valid coordinates"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header / Status Bar */}
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${online ? "bg-emerald-500" : "bg-rose-500"}`} />
          <h1 className="text-xl font-black text-slate-800 tracking-tight italic">DRIVER PANEL</h1>
        </div>
        
        <button
          onClick={() => setOnline(!online)}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all shadow-md ${
            online ? "bg-emerald-600 text-white shadow-emerald-200" : "bg-slate-200 text-slate-600 shadow-transparent"
          }`}
        >
          {online ? <Wifi size={16} /> : <WifiOff size={16} />}
          {online ? "GO OFFLINE" : "GO ONLINE"}
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Map & Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Map Section */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200 border border-slate-100 aspect-video lg:aspect-auto lg:h-[500px] relative">
            {!online && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-10 flex items-center justify-center text-white flex-col">
                <WifiOff size={48} className="mb-4 opacity-50" />
                <p className="text-xl font-bold">You are currently offline</p>
              </div>
            )}
            {location.lat && (
              <RideMap rides={acceptedRide ? [acceptedRide] : pendingRides} driverLocation={location} />
            )}
          </div>

          {/* Manual Location Override (Debug/Testing) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center">
             <div className="flex items-center gap-2 text-slate-500 mr-2 font-semibold">
               <Compass size={18} /> <span className="text-xs uppercase tracking-widest">Dev Overrides</span>
             </div>
             <input
               type="number"
               placeholder="Lat"
               value={manualLat}
               onChange={(e) => setManualLat(e.target.value)}
               className="bg-slate-50 border-none rounded-lg px-4 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500"
             />
             <input
               type="number"
               placeholder="Lng"
               value={manualLng}
               onChange={(e) => setManualLng(e.target.value)}
               className="bg-slate-50 border-none rounded-lg px-4 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500"
             />
             <button onClick={setManualLocation} className="text-xs font-bold text-blue-600 hover:text-blue-700 underline px-2">
               Update GPS
             </button>
          </div>
        </div>

        {/* Right Column: Ride Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Job Card */}
          {acceptedRide ? (
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl shadow-blue-900/20 relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Navigation size={80} />
              </div>
              <span className="bg-blue-500 text-[10px] font-black px-2 py-1 rounded mb-4 inline-block tracking-widest uppercase">Ongoing Ride</span>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="w-0.5 h-10 bg-slate-700" />
                    <MapPin size={16} className="text-rose-400" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-bold tracking-tighter">Pickup</p>
                      <p className="font-semibold text-sm line-clamp-1">{acceptedRide.pickup_address}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase font-bold tracking-tighter">Dropoff</p>
                      <p className="font-semibold text-sm line-clamp-1">{acceptedRide.dropoff_address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 border-y border-slate-800">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-slate-400" />
                    <span className="text-sm font-medium">{acceptedRide.ride_type}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">$XX.XX</span>
                </div>

                <button
                  onClick={() => handleCompleteRide(acceptedRide.id)}
                  className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                >
                  <CheckCircle2 size={20} />
                  COMPLETE RIDE
                </button>
              </div>
            </div>
          ) : (
            /* Pending Requests List */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-full max-h-[700px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-800 uppercase tracking-tighter">Requests Nearby</h3>
                {loadingRides && <Loader2 size={18} className="animate-spin text-blue-600" />}
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                {pendingRides.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">Scanning for riders...</p>
                  </div>
                ) : (
                  pendingRides.map((ride) => (
                    <div key={ride.id} className="group bg-slate-50 hover:bg-white p-4 rounded-2xl border border-transparent hover:border-slate-200 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase tracking-widest">{ride.ride_type}</span>
                         <span className="text-xs text-slate-400 font-medium">Just now</span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin size={14} className="text-emerald-500 mt-1 shrink-0" />
                          <p className="text-slate-700 font-medium line-clamp-1">{ride.pickup_address}</p>
                        </div>
                        <div className="flex items-start gap-2 text-sm opacity-60">
                          <Navigation size={14} className="text-slate-400 mt-1 shrink-0" />
                          <p className="text-slate-700 line-clamp-1">{ride.dropoff_address}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptRide(ride.id)}
                        disabled={accepting}
                        className="w-full bg-blue-600 group-hover:bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                      >
                        {accepting ? "ACCEPTING..." : "ACCEPT REQUEST"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}