import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupDriver } from "../api/driverAuthApi";

export default function DriverSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicle_number: "",
    vehicle_model: "",
    vehicle_type: ""
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await signupDriver(form);
  
      if (data.driver?.stripe_account_id) {
        alert("Signup successful! Stripe account created.");
        console.log("Stripe Account ID:", data.driver.stripe_account_id);
  
        // Optional: redirect to driver dashboard or Stripe onboarding
        navigate("/driver/dashboard");
      } else {
        alert("Signup successful, but Stripe account not created.");
      }
    } catch (err) {
      alert(err.message || "Signup failed");
    }
  };
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Driver Sign Up</h2>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
          autoComplete="name"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
          autoComplete="email"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
          autoComplete="tel"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
          autoComplete="new-password"
        />

        <input
          type="text"
          name="vehicle_number"
          placeholder="Vehicle Number"
          value={form.vehicle_number}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="vehicle_model"
          placeholder="Vehicle Model"
          value={form.vehicle_model}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="text"
          name="vehicle_type"
          placeholder="Vehicle Type"
          value={form.vehicle_type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
        >
          Sign Up
        </button>

        {/* Bottom link */}
        <p className="text-center text-gray-600 mt-2">
          Already have an account?{" "}
          <Link to="/driver/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}