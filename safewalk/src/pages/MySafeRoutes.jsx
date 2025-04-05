
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function SafeRouteFinder() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [showRoutes, setShowRoutes] = useState(false);

  const handleFindRoutes = (e) => {
    e.preventDefault();
    if (selectedStart && selectedEnd) {
      setShowRoutes(true);
    } else {
      alert('Please select both start and end locations from suggestions');
    }
  };

  const fetchSuggestions = async (query, setResults) => {
    if (query.length < 3) return setResults([]);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
    const res = await fetch(url);
    const data = await res.json();
    setResults(data.slice(0, 5));
  };

  useEffect(() => {
    fetchSuggestions(start, setStartSuggestions);
  }, [start]);

  useEffect(() => {
    fetchSuggestions(end, setEndSuggestions);
  }, [end]);

  const routeSuggestions = [
    {
      id: 1,
      name: "Route A",
      steps: [
        "Start at selected location",
        "Take left towards Pine Street",
        "Wait at Bus Stop (2 miles ahead)",
        "Turn right at Central Plaza",
        "Reach destination"
      ],
      duration: "16 mins",
      zones: 4,
      color: "green",
      path: [selectedStart?.latlng, [37.7790, -122.4180], [37.7805, -122.4160], selectedEnd?.latlng],
    },
    {
      id: 2,
      name: "Route B",
      steps: [
        "Go straight through Elm Street",
        "Turn left at Public Library",
        "Reach destination"
      ],
      duration: "14 mins",
      zones: 3,
      color: "blue",
      path: [selectedStart?.latlng, [37.7755, -122.4170], selectedEnd?.latlng],
    },
    {
      id: 3,
      name: "Route C",
      steps: [
        "Take alley behind Annex",
        "Merge with Sunset Road",
        "Reach destination"
      ],
      duration: "10 mins",
      zones: 2,
      color: "orange",
      path: [selectedStart?.latlng, [37.7730, -122.4170], selectedEnd?.latlng],
    },
    {
      id: 4,
      name: "Route D",
      steps: [
        "Go straight down Market Lane",
        "Reach destination"
      ],
      duration: "8 mins",
      zones: 1,
      color: "red",
      path: [selectedStart?.latlng, selectedEnd?.latlng],
    },
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-yellow-400">🧭 Safe Route Finder</h1>
        <form onSubmit={handleFindRoutes} className="space-y-6 md:flex md:space-x-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Start Location"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setSelectedStart(null);
              }}
              className="p-3 rounded bg-gray-800 text-white w-full"
              required
            />
            {startSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-gray-700 w-full rounded mt-1 shadow">
                {startSuggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    className="p-2 hover:bg-gray-600 cursor-pointer text-sm"
                    onClick={() => {
                      setStart(sug.display_name);
                      setSelectedStart({ latlng: [parseFloat(sug.lat), parseFloat(sug.lon)] });
                      setStartSuggestions([]);
                    }}
                  >
                    {sug.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              placeholder="Destination"
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
                setSelectedEnd(null);
              }}
              className="p-3 rounded bg-gray-800 text-white w-full"
              required
            />
            {endSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-gray-700 w-full rounded mt-1 shadow">
                {endSuggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    className="p-2 hover:bg-gray-600 cursor-pointer text-sm"
                    onClick={() => {
                      setEnd(sug.display_name);
                      setSelectedEnd({ latlng: [parseFloat(sug.lat), parseFloat(sug.lon)] });
                      setEndSuggestions([]);
                    }}
                  >
                    {sug.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded">
            🔍 Find Routes
          </button>
        </form>

        {showRoutes && selectedStart && selectedEnd && (
          <>
            <div className="space-y-6">
              {routeSuggestions.map((route, index) => (
                <div key={route.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                  <h2 className="text-xl font-bold text-green-300">{index + 1}. {route.name}</h2>
                  <p className="text-gray-300">🕒 {route.duration} | ✅ Zones: {route.zones}</p>
                  <ul className="list-disc ml-6 text-sm mt-2 text-gray-200">
                    {route.steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <div className="h-[400px] rounded-xl overflow-hidden mt-10">
              <MapContainer center={selectedStart.latlng} zoom={14} className="h-full w-full z-0">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {routeSuggestions.map((route, idx) => (
                  <Polyline
                    key={idx}
                    positions={route.path}
                    pathOptions={{ color: route.color, weight: 4 }}
                  />
                ))}
                <Marker position={selectedStart.latlng}>
                  <Popup>Start: {start}</Popup>
                </Marker>
                <Marker position={selectedEnd.latlng}>
                  <Popup>End: {end}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

