import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginDriver } from "../api/driverAuthApi";

export default function DriverLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginDriver({ email, password });

      console.log("Login response:", res); // 🔍 Debug

      // ✅ Save token
      localStorage.setItem("driverToken", res.token);

      // ✅ Save full driver object
      localStorage.setItem("driverInfo", JSON.stringify(res.driver));

      // ✅ IMPORTANT: Save driverId separately
      localStorage.setItem("driverId", res.driver.id);

      alert("Login successful");
      navigate("/driver/dashboard");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Driver Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Login
        </button>

        <p className="text-center text-gray-600 mt-2">
          Don't have an account?{" "}
          <Link to="/driver/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
