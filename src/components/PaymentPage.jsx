import { useLocation } from "react-router-dom";
import { createOrder } from "../api/paymentApi";

export default function PaymentPage() {
  const location = useLocation();
  const rideId = location.state?.rideId;

  const handlePayment = async () => {
    try {
      console.log("RideId before API:", rideId);
  
      if (!rideId) {
        alert("rideId missing!");
        return;
      }
  
      const order = await createOrder(rideId);
      console.log("Order response:", order);
  
      if (!order.payment_session_id) {
        alert("Payment session missing!");
        return;
      }
  
      const cashfree = new window.Cashfree({
        mode: "sandbox",
      });
  
      cashfree.checkout({
        paymentSessionId: order.payment_session_id,
        redirectTarget: "_self",
      });
  
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Check console.");
    }
  };
  return (
    <div>
      <h2>Complete Payment</h2>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
}