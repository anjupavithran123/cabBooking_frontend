import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginDriver } from "../api/driverAuthApi";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function DriverLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginDriver({ email, password });
      localStorage.setItem("driverToken", res.token);
      localStorage.setItem("driverInfo", JSON.stringify(res.driver));
      localStorage.setItem("driverId", res.driver.id);
      
      navigate("/driver/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      {/* Background Decorative Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-gray-100 p-10">
          
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg transform rotate-12 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm -rotate-12" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 mt-2 text-sm">Please enter your details to access your portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm animate-in fade-in zoom-in duration-200">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={19} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link to="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={19} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-lg shadow-blue-900/10"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm">
              New to the platform?{" "}
              <Link
                to="/driver/signup"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        {/* Support Link */}
        <p className="text-center mt-8 text-xs text-gray-400">
          &copy; 2024 DriverFlow Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}