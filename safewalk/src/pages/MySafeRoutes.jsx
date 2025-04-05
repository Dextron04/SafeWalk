import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function SafeTransitRouteFinder() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeSteps, setRouteSteps] = useState([]);
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFindRoute = async (e) => {
    e.preventDefault();
    if (!origin || !destination) {
      alert("Please provide both origin and destination.");
      return;
    }

    setLoading(true);
    const url = `http://localhost:5000/api/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== "OK") {
        alert("No route found or error in API.");
        console.error(data);
        setLoading(false);
        return;
      }

      const steps = data.routes[0].legs[0].steps;
      const extractedSteps = steps.map((step, idx) => {
        const info = {
          index: idx + 1,
          instruction: step.html_instructions,
          travelMode: step.travel_mode,
          duration: step.duration.text,
        };

        if (step.travel_mode === "TRANSIT") {
          info.transit = {
            departure: step.transit_details.departure_stop.name,
            arrival: step.transit_details.arrival_stop.name,
            line: step.transit_details.line.short_name || step.transit_details.line.name,
            stops: step.transit_details.num_stops,
          };
        }

        return info;
      });

      const routePath = data.routes[0].overview_polyline.points;
      const decodedPath = decodePolyline(routePath);
      setPath(decodedPath);
      setRouteSteps(extractedSteps);
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

        {routeSteps.length > 0 && (
          <div className="space-y-4 mb-10">
            {routeSteps.map((step, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-200 mb-1">
                  <strong>{step.index}.</strong>{" "}
                  <span dangerouslySetInnerHTML={{ __html: step.instruction }} />
                </p>
                {step.transit && (
                  <div className="text-sm text-blue-300 mt-1">
                    🚌 Take <strong>{step.transit.line}</strong> from{" "}
                    <strong>{step.transit.departure}</strong> to{" "}
                    <strong>{step.transit.arrival}</strong> ({step.transit.stops} stops)
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="h-[400px] rounded-xl overflow-hidden">
          <MapContainer center={[37.7749, -122.4194]} zoom={13} className="h-full w-full z-0">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {path.length > 0 && (
              <Polyline positions={path} pathOptions={{ color: 'lime', weight: 4 }} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
