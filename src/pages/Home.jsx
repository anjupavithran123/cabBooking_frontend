import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleDriverClick = (e) => {
    const driverId = localStorage.getItem("driverId");
    if (driverId) {
      // Prevent default link navigation
      e.preventDefault();
      // Redirect to dashboard if already logged in
      navigate("/driver/dashboard");
    }
    // else, allow normal link navigation to /driver/login
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Cab Booking App 🚖
      </h1>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-black text-white rounded-lg text-center"
        >
          Sign In
        </Link>

        <Link
          to="/signup"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-center"
        >
          Sign Up
        </Link>

        <Link
          to="/driver/login"
          onClick={handleDriverClick}
          className="px-6 py-3 bg-green-600 text-white rounded-lg text-center"
        >
          Driver Sign Up
        </Link>
      </div>
    </div>
  );
}