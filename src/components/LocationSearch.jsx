import { useState, useRef } from "react";

export default function LocationSearch({ placeholder, setLocation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);

  const searchLocation = (value) => {
    setQuery(value);

    if (value.length < 3) {
      setResults([]);
      return;
    }

    // Debounce requests to avoid 429 errors
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://corsproxy.io/?https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "rider-app@example.com", // Required by Nominatim
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch location");

        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.log("Search error:", error);
        setResults([]);
      }
    }, 500); // 500ms debounce
  };

  const selectLocation = (place) => {
    const location = {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      address: place.display_name,
    };
    setLocation(location);
    setQuery(place.display_name);
    setResults([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => searchLocation(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />

      {results.length > 0 && (
        <div
          style={{
            position: "absolute",
            background: "white",
            width: "100%",
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #ccc",
            zIndex: 1000,
          }}
        >
          {results.map((place, index) => (
            <div
              key={index}
              style={{ padding: "8px", cursor: "pointer" }}
              onClick={() => selectLocation(place)}
            >
              {place.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}