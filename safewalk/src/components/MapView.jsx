import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  Marker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to handle map reference
function MapController({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [map, center]);

  return null;
}

export default function MapView() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default center to SF
  const [maxCount, setMaxCount] = useState(1); // Track the maximum count for scaling

  // Fetch 911 calls from the server API
  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        setLoading(true);

        // Query for hotspots from our server API
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/911calls?format=hotspots&limit=1000`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch 911 calls data");
        }

        const data = await response.json();
        console.log(`Fetched ${data.totalHotspots} hotspots from server API`);

        // Set the maximum count for scaling
        setMaxCount(data.maxCount);

        // Set the map center to the first hotspot if available
        if (data.hotspots.length > 0) {
          setMapCenter([data.hotspots[0].lat, data.hotspots[0].lng]);
        }

        setHotspots(data.hotspots);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching 911 calls:", err);
        setError("Failed to load 911 call data. Please try again later.");
        setLoading(false);
      }
    };

    fetchHotspots();

    // Set up polling to refresh data every 5 minutes
    const intervalId = setInterval(fetchHotspots, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getHotspotColor = (count) => {
    if (count >= 20) return "#991B1B"; // red-800 - highest intensity
    if (count >= 15) return "#DC2626"; // red-600
    if (count >= 10) return "#F97316"; // orange-500
    if (count >= 5) return "#F59E0B"; // amber-500
    return "#22C55E"; // green-500 - lowest intensity
  };

  // Get radius based on call count - directly proportional to frequency
  const getHotspotRadius = (count) => {
    // Base radius of 50 meters, scaling up to 500 meters for the highest frequency
    const minRadius = 50;
    const maxRadius = 500;

    // Linear scaling based on count relative to max count
    const scale = count / maxCount;
    return minRadius + (maxRadius - minRadius) * scale;
  };

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} />

        {loading && (
          <div className="absolute top-4 left-4 z-50 bg-white p-2 rounded shadow-md">
            <p>Loading hotspots...</p>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-4 z-50 bg-red-100 p-2 rounded shadow-md text-red-800">
            <p>{error}</p>
          </div>
        )}

        {/* Display all hotspots */}
        {hotspots.map((hotspot, i) => (
          <Circle
            key={i}
            center={[hotspot.lat, hotspot.lng]}
            radius={getHotspotRadius(hotspot.count)}
            pathOptions={{
              color: getHotspotColor(hotspot.count),
              fillColor: getHotspotColor(hotspot.count),
              fillOpacity: 0.5,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">Hotspot Area</h3>
                <p>
                  <span className="font-semibold">Call Count:</span>{" "}
                  {hotspot.count}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {hotspot.calls[0]?.intersection_name || "Unknown"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This area has a high concentration of 911 calls.
                </p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>

      {/* Fixed legend positioned in viewport, not just in map */}
      <div className="fixed bottom-6 right-6 bg-white p-3 rounded-lg shadow-lg z-50 max-w-xs opacity-90 hover:opacity-100 transition-opacity">
        <h3 className="font-bold text-gray-800 mb-2">SF 911 Call Hotspots</h3>
        <div className="space-y-1">
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: "#991B1B" }}
            ></div>
            <span className="text-xs">Dark Red: 20+ calls</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: "#DC2626" }}
            ></div>
            <span className="text-xs">Red: 15+ calls</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: "#F97316" }}
            ></div>
            <span className="text-xs">Orange: 10+ calls</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: "#F59E0B" }}
            ></div>
            <span className="text-xs">Yellow: 5+ calls</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: "#22C55E" }}
            ></div>
            <span className="text-xs">Green: 1-4 calls</span>
          </div>
        </div>
      </div>
    </div>
  );
}
