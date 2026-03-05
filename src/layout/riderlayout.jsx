import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import RideRequests from "../pages/riderequest";
import Profile from "../pages/Riderprofile";
import RiderStatus from "../components/RiderStatus";
import RideHistory from "../components/RideHistory";
import supabase from "../config/supabase"; // to fetch avatar from Supabase

export default function RiderLayout() {
  const { signOut, userId } = useAuth();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("rides"); // default
  const [rider, setRider] = useState({ name: "", profile_image: "" });

  // Fetch rider profile for sidebar
  useEffect(() => {
    if (!userId) return; // Wait until Clerk provides the userId
  
    const fetchRiderProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("name, profile_image")
          .eq("clerk_id", userId)
          .single(); // Expect a single row
  
        if (error) throw error;
  
        setRider({
          name: data.name || "Rider",
          profile_image: data.profile_image || "",
        });
      } catch (err) {
        console.error("Error fetching rider profile:", err);
      }
    };
  
    fetchRiderProfile();
  }, [userId]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        {/* Sidebar Top - Avatar */}
        <div className="p-4 border-b border-gray-700 flex flex-col items-center">
          {rider.profile_image ? (
            <img
              src={rider.profile_image}
              alt="Rider Avatar"
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-600 mb-2 flex items-center justify-center">
              <span className="text-2xl font-bold">
                {rider.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <span className="font-semibold text-center">{rider.name}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActivePage("profile")}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activePage === "profile" ? "bg-gray-700" : ""
            }`}
          >
            Profile
          </button>

          <button
            onClick={() => setActivePage("rides")}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activePage === "rides" ? "bg-gray-700" : ""
            }`}
          >
            Ride Requests
          </button>

          <button
            onClick={() => setActivePage("status")}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activePage === "status" ? "bg-gray-700" : ""
            }`}
          >
            Ride Status
          </button>

          <button
            onClick={() => setActivePage("history")}
            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-700 ${
              activePage === "history" ? "bg-gray-700" : ""
            }`}
          >
            Ride History
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
          {activePage === "rides" && <RideRequests />}
          {activePage === "profile" && <Profile />}
          {activePage === "status" && <RiderStatus />}
          {activePage === "history" && <RideHistory />}
        </main>
      </div>
    </div>
  );
}