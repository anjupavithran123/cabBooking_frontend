import { useLocation } from "react-router-dom";
import { createOrder } from "../api/paymentApi";
import { useState } from "react";

export default function PaymentPage() {
  const location = useLocation();
  const rideId = location.state?.rideId;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!rideId) {
      alert("Ride ID is missing!");
      return;
    }

    setLoading(true);

    try {
      const order = await createOrder(rideId);

      const cashfree = new window.Cashfree({
        mode: "sandbox", // change to "live" in production
      });

      cashfree.checkout({
        paymentSessionId: order.payment_session_id,
        redirectTarget: "_self",
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Complete Your Payment
        </h2>

        <p className="text-gray-600 mb-6">
          Click the button below to pay for your ride. Ensure you have a valid payment method ready.
        </p>

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition 
            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}