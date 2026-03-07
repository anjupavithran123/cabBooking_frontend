import { useEffect, useState } from "react";
import { getDriverRating } from "../api/ratingApi";

export default function DriverRating({ driverId }) {
  const [rating, setRating] = useState(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await getDriverRating(driverId);
        setRating(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (driverId) fetchRating();
  }, [driverId]);

  if (!rating) {
    return (
      <div className="p-6 bg-white rounded-xl shadow">
        <p className="text-gray-500">Loading ratings...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white shadow-lg rounded-xl p-6">

      {/* Rating summary */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Driver Rating
        </h2>

        <div className="text-yellow-500 text-lg font-semibold">
          ⭐ {rating.averageRating} 
          <span className="text-gray-600 text-sm ml-2">
            ({rating.totalReviews} reviews)
          </span>
        </div>
      </div>

      {/* Reviews */}
      {rating.reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet</p>
      ) : (
        <div className="space-y-3">
          {rating.reviews.map((r, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="text-yellow-500 font-medium">
                {"⭐".repeat(r.rating)}
              </div>

              <p className="text-gray-700 text-sm mt-1">
                {r.review || "No comment"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}