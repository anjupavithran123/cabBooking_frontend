// src/api/userApi.js
export const syncUser = async (getToken) => {
    try {
      const token = await getToken();
  
      const res = await fetch("http://localhost:5000/api/users", { // ✅ Make sure endpoint matches backend
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // optional, your backend doesn't require body
        },
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "User sync failed");
      }
  
      return res.json();
    } catch (err) {
      console.error("SyncUser Error:", err);
      throw err;
    }
  };