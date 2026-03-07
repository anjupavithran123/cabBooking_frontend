import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { submitRating } from "../api/ratingApi";

export default function RateDriver({ rideId, driverId }) {
  const { userId } = useAuth();

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    console.log("rideId:", rideId);
    console.log("driverId:", driverId);
    console.log("userId:", userId);

    if (!rideId || !driverId || !userId) {
      alert("Missing ride or user information");
      return;
    }

    try {
      setLoading(true);

      await submitRating({
        rideId,
        riderId: userId,
        driverId,
        rating,
        review
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Rating error:", error);
      alert("Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
        <h3 className="text-xl font-semibold text-green-600">
          ⭐ Thank you for rating your driver!
        </h3>
        <p className="text-gray-600 mt-2">
          Your feedback helps improve our service.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gray-50 p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-center mb-4">
        Rate Your Driver
      </h3>

      <div className="flex justify-center mb-4">
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-3xl ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <p className="text-center mb-4">
        Rating: {rating}/5
      </p>

      <textarea
        className="w-full border rounded-lg p-3 mb-4"
        rows="3"
        placeholder="Write your review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        {loading ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}