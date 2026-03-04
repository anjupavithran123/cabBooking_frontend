import { useState, useEffect } from "react";
import supabase from "../config/supabase";

export default function DriverProfile() {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    avatar_url: "",
    vehicle_type: "",
    vehicle_number: "",
    payment_per_km: "", // ✅ new field
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const driverId = localStorage.getItem("driverId"); // driver ID stored on login

  // Fetch driver profile
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
          payment_per_km: driver.payment_per_km || "", // ✅ load rate
        });
      } catch (err) {
        console.error("Error fetching driver profile:", err);
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [driverId]);

  // Save updated profile
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("drivers")
        .update(profile)
        .eq("id", driverId);

      if (error) throw error;

      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Upload profile picture
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
      console.error(uploadError);
      setMessage("Failed to upload avatar");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setProfile({ ...profile, avatar_url: urlData.publicUrl });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Driver Profile</h2>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {loading && <p>Loading...</p>}

      {/* Profile Info */}
      <div className="mb-4">
        <label className="block mb-1">Name</label>
        <input
          className="border px-2 py-1 w-full rounded"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Phone</label>
        <input
          className="border px-2 py-1 w-full rounded"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Vehicle Type</label>
        <input
          className="border px-2 py-1 w-full rounded"
          value={profile.vehicle_type}
          onChange={(e) =>
            setProfile({ ...profile, vehicle_type: e.target.value })
          }
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Vehicle Number</label>
        <input
          className="border px-2 py-1 w-full rounded"
          value={profile.vehicle_number}
          onChange={(e) =>
            setProfile({ ...profile, vehicle_number: e.target.value })
          }
        />
      </div>

      {/* ✅ Payment per km */}
      <div className="mb-4">
        <label className="block mb-1">Payment per km</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="border px-2 py-1 w-full rounded"
          value={profile.payment_per_km}
          onChange={(e) =>
            setProfile({ ...profile, payment_per_km: e.target.value })
          }
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Profile Picture</label>
        <input type="file" onChange={handleAvatarUpload} />
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="mt-2 w-24 h-24 rounded-full object-cover"
          />
        )}
      </div>

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleSaveProfile}
      >
        Save Profile
      </button>
    </div>
  );
}