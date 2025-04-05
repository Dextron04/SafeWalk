import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Route colors for different routes
const ROUTE_COLORS = ['#00FF00', '#FF0000', '#0000FF', '#FFA500', '#800080'];

export default function SafeTransitRouteFinder() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default to SF

  const handleFindRoute = async (e) => {
    e.preventDefault();
    if (!origin || !destination) {
      alert("Please provide both origin and destination.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ origin, destination }),
      });

      const data = await response.json();

      if (data.status !== "OK") {
        alert("No route found or error in API.");
        console.error(data);
        setLoading(false);
        return;
      }

      // Extract all routes
      const allRoutes = data.routes.map((route, index) => {
        const leg = route.legs[0];
        return {
          index,
          path: decodePolyline(route.overview_polyline.points),
          distance: leg.distance.text,
          duration: leg.duration.text,
          summary: route.summary,
          steps: leg.steps.map((step, idx) => ({
            index: idx + 1,
            instruction: step.html_instructions,
            distance: step.distance.text,
            duration: step.duration.text,
          })),
          warnings: route.warnings || [],
        };
      });

      setRoutes(allRoutes);

      // Set start and end locations for markers
      setStartLocation(data.routes[0].legs[0].start_location);
      setEndLocation(data.routes[0].legs[0].end_location);

      // Center the map on the route
      const bounds = data.routes[0].bounds;
      const center = [
        (bounds.northeast.lat + bounds.southwest.lat) / 2,
        (bounds.northeast.lng + bounds.southwest.lng) / 2
      ];
      setMapCenter(center);

      // Select the first route by default
      setSelectedRouteIndex(0);

    } catch (error) {
      console.error("API error:", error);
      alert("Failed to fetch directions.");
    } finally {
      setLoading(false);
    }
  };

  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
  };

  const handleRouteSelect = (index) => {
    setSelectedRouteIndex(index);
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">🚍 SF Transit Directions</h1>

        <form onSubmit={handleFindRoute} className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Start Location"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="p-3 bg-gray-800 rounded text-white w-full"
            required
          />
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="p-3 bg-gray-800 rounded text-white w-full"
            required
          />
          <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded">
            {loading ? "Finding..." : "Get Directions"}
          </button>
        </form>

        {routes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-3">Available Routes</h2>
            <div className="flex flex-wrap gap-3">
              {routes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => handleRouteSelect(index)}
                  className={`px-4 py-2 rounded-lg flex items-center ${selectedRouteIndex === index
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-gray-800 text-white'
                    }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: ROUTE_COLORS[index % ROUTE_COLORS.length] }}
                  ></div>
                  <span>Route {index + 1}</span>
                  <span className="ml-2 text-sm">
                    ({route.distance} • {route.duration})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {routes.length > 0 && (
          <div className="space-y-4 mb-10">
            <h2 className="text-xl font-semibold text-yellow-400">
              Route {selectedRouteIndex + 1} Instructions
              <span className="text-sm font-normal ml-2">
                ({routes[selectedRouteIndex].distance} • {routes[selectedRouteIndex].duration})
              </span>
            </h2>

            {routes[selectedRouteIndex].warnings.length > 0 && (
              <div className="bg-yellow-900 text-yellow-200 p-3 rounded-lg mb-4">
                <h3 className="font-semibold">Warnings:</h3>
                <ul className="list-disc pl-4">
                  {routes[selectedRouteIndex].warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {routes[selectedRouteIndex].steps.map((step, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-200 mb-1">
                  <strong>{step.index}.</strong>{" "}
                  <span dangerouslySetInnerHTML={{ __html: step.instruction }} />
                </p>
                <div className="text-xs text-gray-400 mt-1">
                  Distance: {step.distance} • Duration: {step.duration}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="h-[500px] rounded-xl overflow-hidden">
          <MapContainer
            center={mapCenter}
            zoom={13}
            className="h-full w-full z-0"
            key={mapCenter.join(',')} // Force re-render when center changes
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Display all routes with different colors */}
            {routes.map((route, index) => (
              <Polyline
                key={index}
                positions={route.path}
                pathOptions={{
                  color: ROUTE_COLORS[index % ROUTE_COLORS.length],
                  weight: selectedRouteIndex === index ? 6 : 3,
                  opacity: selectedRouteIndex === index ? 1 : 0.7
                }}
              />
            ))}

            {startLocation && (
              <Marker position={[startLocation.lat, startLocation.lng]}>
                <Popup>Start: {origin}</Popup>
              </Marker>
            )}
            {endLocation && (
              <Marker position={[endLocation.lat, endLocation.lng]}>
                <Popup>End: {destination}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
