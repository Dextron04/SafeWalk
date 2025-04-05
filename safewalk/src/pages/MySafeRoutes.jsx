import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AlertsFeed from '../components/AlertsFeed';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Route colors for different routes
const ROUTE_COLORS = ['#00FF00', '#FF0000', '#0000FF', '#FFA500', '#800080'];

// Component to handle map reference
function MapController({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [map, userLocation]);

  return null;
}

export default function MySafeRoutes() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default center to SF
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showAlerts, setShowAlerts] = useState(true);

  // Refs for Google Places Autocomplete
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const originAutocompleteRef = useRef(null);
  const destinationAutocompleteRef = useRef(null);

  // Get user's current location
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setMapCenter([latitude, longitude]);
            setLocationError(null);
          },
          (error) => {
            console.error('Error getting location:', error);
            setLocationError('Unable to get your location. Please enable location services.');
          }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser.');
      }
    };

    getUserLocation();

    // Set up periodic location updates
    const locationInterval = setInterval(getUserLocation, 60000); // Update every minute

    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    // Load Google Maps JavaScript API with Places library
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initAutocomplete();
      } else {
        const script = document.createElement('script');
        // Use a direct API key value
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAbhHlHyUaD3PLPfLolagQWQrcfeZO4fHA&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      }
    };

    loadGoogleMapsScript();

    // Cleanup can be added here if necessary on unmount.
  }, []);

  const initAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    // Initialize origin autocomplete
    if (originInputRef.current) {
      originAutocompleteRef.current = new window.google.maps.places.Autocomplete(
        originInputRef.current,
        {
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'geometry', 'formatted_address'],
          types: ['geocode'], // Use a single type to avoid the error
        }
      );
      originAutocompleteRef.current.addListener('place_changed', () => {
        const place = originAutocompleteRef.current.getPlace();
        if (place.formatted_address) {
          setOrigin(place.formatted_address);
        }
      });
    }

    // Initialize destination autocomplete
    if (destinationInputRef.current) {
      destinationAutocompleteRef.current = new window.google.maps.places.Autocomplete(
        destinationInputRef.current,
        {
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'geometry', 'formatted_address'],
          types: ['geocode'], // Use a single type to avoid the error
        }
      );
      destinationAutocompleteRef.current.addListener('place_changed', () => {
        const place = destinationAutocompleteRef.current.getPlace();
        if (place.formatted_address) {
          setDestination(place.formatted_address);
        }
      });
    }
  };

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

      // Center the map on the route bounds
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

  // Decodes an encoded polyline string into an array of [lat, lng] coordinates.
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">🚍 SF Transit Directions</h1>

        <form onSubmit={handleFindRoute} className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            ref={originInputRef}
            type="text"
            placeholder="Start Location"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="p-3 bg-gray-800 rounded text-white w-full"
            required
          />
          <input
            ref={destinationInputRef}
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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
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
              <div className="space-y-4 mb-6">
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
                key={mapCenter.join(',')}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {userLocation && (
                  <>
                    <Marker position={[userLocation.lat, userLocation.lng]}>
                      <Popup>Your Location</Popup>
                    </Marker>
                    <MapController userLocation={userLocation} />
                  </>
                )}

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

                {showAlerts && userLocation && (
                  <AlertsFeed userLocation={userLocation} />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-yellow-400">Safety Alerts</h2>
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                >
                  {showAlerts ? 'Hide' : 'Show'}
                </button>
              </div>

              {locationError && (
                <div className="bg-red-900 text-red-200 p-3 rounded-lg mb-4">
                  <p>{locationError}</p>
                  <p className="text-sm mt-2">Enable location services to see nearby alerts.</p>
                </div>
              )}

              {showAlerts && userLocation ? (
                <div className="text-gray-300">
                  <p>Alerts are displayed on the map. Toggle the "Show" button to show/hide alerts.</p>
                </div>
              ) : (
                <p className="text-gray-300">Enable location services to see nearby alerts.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
