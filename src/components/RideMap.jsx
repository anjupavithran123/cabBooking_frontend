import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

const center = [10.8505, 76.2711]; // Kerala default

// Fix marker icon issue      *   OPENSTREETMAP    *
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
});

function LocationSelector({ setPickup, setDropoff }) {
  const [clickStage, setClickStage] = useState("pickup");

  useMapEvents({
    click(e) {
      if (clickStage === "pickup") {
        setPickup(e.latlng);
        setClickStage("dropoff");
      } else {
        setDropoff(e.latlng);
        setClickStage("pickup");
      }
    }
  });

  return null;
}

export default function RideMap({ pickup, dropoff, setPickup, setDropoff }) {
  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationSelector setPickup={setPickup} setDropoff={setDropoff} />

      {pickup && (
        <Marker position={pickup}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}

      {dropoff && (
        <Marker position={dropoff}>
          <Popup>Dropoff Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}