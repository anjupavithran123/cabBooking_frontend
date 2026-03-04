import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase.js";
import Driverdashboard from "../pages/DriverDashboard.jsx";
import DriverProfile from "../components/Driverprofile.jsx";
import DriverRideHistory from "../components/driverhistory.jsx";
import AddBankDetails from "../components/AddBankDetails.jsx";

export default function DriverLayout() {
  const navigate = useNavigate();
  const driverId = localStorage.getItem("driverId");

  // Default active page
  const [activePage, setActivePage] = useState("rides");

  // Driver profile state (for sidebar)
  const [driver, setDriver] = useState({ name: "", avatar_url: "" });

  useEffect(() => {
    const fetchDriver = async () => {
      if (!driverId) return;
      try {
        const { data, error } = await supabase
          .from("drivers")
          .select("name, avatar_url")
          .eq("id", driverId)
          .single();
        if (error) throw error;
        setDriver({ name: data.name || "", avatar_url: data.avatar_url || "" });
      } catch (err) {
        console.error("Error fetching driver for sidebar:", err);
      }
    };

    fetchDriver();
  }, [driverId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("driverId");
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        {/* Sidebar Top - Avatar */}
        <div className="p-4 border-b border-gray-700 flex flex-col items-center">
          {driver.avatar_url ? (
            <img
              src={driver.avatar_url}
              alt="Driver Avatar"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-600 mb-2" />
          )}
          <span className="font-semibold text-center">{driver.name || "Driver"}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActivePage("rides")}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activePage === "rides" ? "bg-gray-700" : ""
            }`}
          >
            Rides
          </button>

          <button
            onClick={() => setActivePage("profile")}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activePage === "profile" ? "bg-gray-700" : ""
            }`}
          >
            Profile
          </button>

          <button
            onClick={() => setActivePage("history")}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activePage === "history" ? "bg-gray-700" : ""
            }`}
          >
            Ride History
          </button>

          <button
            onClick={() => setActivePage("bankdetails")}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activePage === "bankdetails" ? "bg-gray-700" : ""
            }`}
          >
            Add Bank Details
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold capitalize">{activePage}</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          {activePage === "rides" && <Driverdashboard />}
          {activePage === "profile" && <DriverProfile />}
          {activePage === "history" && <DriverRideHistory />}
          {activePage === "bankdetails" && <AddBankDetails />}
        </main>
      </div>
    </div>
  );
}