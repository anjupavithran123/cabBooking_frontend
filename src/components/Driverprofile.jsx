import { useState, useEffect } from "react";
import supabase from "../config/supabase";
import { FaUser, FaPhone, FaCar, FaIdBadge, FaMoneyBillWave } from "react-icons/fa";

export default function DriverProfile() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    avatar_url: "",
    vehicle_type: "",
    vehicle_number: "",
    payment_per_km: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);

  const driverId = localStorage.getItem("driverId");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data: driver, error } = await supabase
          .from("drivers")
          .select("*")
          .eq("id", driverId)
          .single();

        if (error) throw error;

        setProfile({
          name: driver.name || "",
          phone: driver.phone || "",
          avatar_url: driver.avatar_url || "",
          vehicle_type: driver.vehicle_type || "",
          vehicle_number: driver.vehicle_number || "",
          payment_per_km: driver.payment_per_km || "",
        });
      } catch (err) {
        console.error(err);
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [driverId]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase
        .from("drivers")
        .update(profile)
        .eq("id", driverId);

      if (error) throw error;

      setMessage("Profile updated successfully ✅");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${driverId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setMessage("Failed to upload avatar ❌");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setProfile({ ...profile, avatar_url: urlData.publicUrl });
    setMessage("Avatar updated ✅");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Driver Profile
        </h2>

        {message && (
          <div className="mb-4 text-center bg-green-100 text-green-700 p-2 rounded">
            {message}
          </div>
        )}

        {loading && (
          <p className="text-center text-gray-500 mb-4">Loading...</p>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg">
              No Photo
            </div>
          )}

          {editMode && (
            <input
              type="file"
              onChange={handleAvatarUpload}
              className="mt-3 text-sm"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="grid grid-cols-1 gap-4">

          {/* View Mode */}
          {!editMode &&
            <>
              <div className="flex items-center gap-3 p-4 border rounded-lg shadow-sm hover:shadow-md transition">
                <FaUser className="text-blue-500 text-xl" />
                <div>
                  <p className="text-gray-600 text-sm">Name</p>
                  <p className="text-gray-800 font-semibold text-lg">{profile.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg shadow-sm hover:shadow-md transition">
                <FaPhone className="text-green-500 text-xl" />
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="text-gray-800 font-semibold text-lg">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg shadow-sm hover:shadow-md transition">
                <FaCar className="text-purple-500 text-xl" />
                <div>
                  <p className="text-gray-600 text-sm">Vehicle Type</p>
                  <p className="text-gray-800 font-semibold text-lg">{profile.vehicle_type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg shadow-sm hover:shadow-md transition">
                <FaIdBadge className="text-yellow-500 text-xl" />
                <div>
                  <p className="text-gray-600 text-sm">Vehicle Number</p>
                  <p className="text-gray-800 font-semibold text-lg">{profile.vehicle_number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg shadow-sm hover:shadow-md transition">
                <FaMoneyBillWave className="text-red-500 text-xl" />
                <div>
                  <p className="text-gray-600 text-sm">Payment per km</p>
                  <p className="text-gray-800 font-semibold text-lg">₹{profile.payment_per_km}</p>
                </div>
              </div>
            </>
          }

          {/* Edit Mode */}
          {editMode &&
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["name", "phone", "vehicle_type", "vehicle_number"].map((field) => (
                <div key={field}>
                  <label className="text-sm text-gray-600 capitalize">{field.replace("_", " ")}</label>
                  <input
                    className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={profile[field]}
                    onChange={(e) =>
                      setProfile({ ...profile, [field]: e.target.value })
                    }
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Payment per km (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full mt-1 border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={profile.payment_per_km}
                  onChange={(e) =>
                    setProfile({ ...profile, payment_per_km: e.target.value })
                  }
                />
              </div>
            </div>
          }
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          {editMode ? (
            <>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className={`bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition ${
                  loading ? "bg-gray-400 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition"
            >
              Update Profile
            </button>
          )}
        </div>

      </div>
    </div>
  );
}