import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { fetchProfile, updateProfile, fetchRides } from "../api/riderapi";
import { useNavigate } from "react-router-dom";
import supabase from "../config/supabase";

export default function RiderDashboard() {
  const { getToken, signOut, userId } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    profile_image: "",
  });

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ===============================
  // Load Profile + Rides
  // ===============================
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await fetchProfile(getToken);

        setProfile({
          ...profileData,
          profile_image: profileData?.profile_image || "",
        });

        const rideData = await fetchRides(getToken);
        setRides(rideData);

      } catch (err) {
        console.error("Load error:", err);
      }
    };

    loadData();
  }, []);

  // ===============================
  // Upload Image
  // ===============================
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload to storage
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Update DB (supports id OR clerk_id)
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_image: publicUrl })
        .eq("clerk_id", userId);   // 🔥 change to .eq("id", profile.id) if needed

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) => ({
        ...prev,
        profile_image: publicUrl,
      }));

    } catch (err) {
      console.error("Upload error:", err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ===============================
  // Update Profile Info
  // ===============================
  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile(getToken, profile);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Rider Dashboard
          </h1>
         
          
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl p-6 grid md:grid-cols-3 gap-6">

          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg bg-gray-200 flex items-center justify-center">
              {profile.profile_image ? (
                <img
                  key={profile.profile_image}
                  src={profile.profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-3xl font-bold text-gray-500">
                  {profile.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-4"
            />

            {uploading && (
              <p className="text-gray-500 mt-2">Uploading...</p>
            )}
          </div>

          {/* Profile Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="text"
                value={profile.email}
                disabled
                className="w-full border p-3 rounded-xl mt-1 bg-gray-100"
              />
            </div>

            <button
              onClick={handleUpdate}
              className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:brightness-110 transition"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </div>

    

      </div>
    </div>
  );
}