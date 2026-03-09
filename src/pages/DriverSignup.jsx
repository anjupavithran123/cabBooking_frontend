import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupDriver } from "../api/driverAuthApi";
import { User, Mail, Phone, Lock, Car, Hash, Truck, Loader2, ArrowRight } from "lucide-react";

export default function DriverSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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
    setLoading(true);
    setError("");

    try {
      const data = await signupDriver(form);
      if (data.driver?.stripe_account_id) {
        navigate("/driver/dashboard");
      } else {
        setError("Account created, but Stripe setup is pending.");
      }
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper component for input icons
  const InputWrapper = ({ icon: Icon, children }) => (
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
        <Icon size={18} />
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4 py-12">
      <div className="w-full max-w-xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join the Fleet</h2>
            <p className="text-gray-500">Start your journey as a professional driver today.</p>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Personal Details</p>
            
            <InputWrapper icon={User}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </InputWrapper>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWrapper icon={Mail}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </InputWrapper>

              <InputWrapper icon={Phone}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </InputWrapper>
            </div>

            <InputWrapper icon={Lock}>
              <input
                type="password"
                name="password"
                placeholder="Create Password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </InputWrapper>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1 mb-3">Vehicle Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWrapper icon={Hash}>
                  <input
                    type="text"
                    name="vehicle_number"
                    placeholder="Plate Number"
                    value={form.vehicle_number}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </InputWrapper>

                <InputWrapper icon={Car}>
                  <input
                    type="text"
                    name="vehicle_model"
                    placeholder="Model"
                    value={form.vehicle_model}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </InputWrapper>
              </div>
              <div className="mt-4">
                <InputWrapper icon={Truck}>
                  {/* CHANGED FROM SELECT TO INPUT TEXT */}
                  <input
                    type="text"
                    name="vehicle_type"
                    placeholder="Vehicle Type "
                    value={form.vehicle_type}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </InputWrapper>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Register Account
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="text-center text-gray-500 text-sm">
            Already have an account?{" "}
            <Link to="/driver/login" className="text-emerald-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}