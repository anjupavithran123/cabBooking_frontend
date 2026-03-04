const token = await getToken();

await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/rides/create`, {
    method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    pickup_address: pickup.address,
    dropoff_address: dropoff.address,
    pickup_lat: pickup.lat,
    pickup_lng: pickup.lng,
    dropoff_lat: dropoff.lat,
    dropoff_lng: dropoff.lng,
    ride_type: rideType
  })
});