import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AlertsFeed from "../components/AlertsFeed";
import RouteAssistant from "../components/RouteAssistant";

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon for incidents
const incidentIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Route colors for different routes
const SELECTED_ROUTE_COLOR = "#00C853"; // More vibrant green
const UNSELECTED_ROUTE_COLOR = "#616161"; // More muted grey

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

// Component to display alerts along a route
function RouteAlerts({ route, onAlertsFound }) {
  const [routeAlerts, setRouteAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const map = useMap();

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "A":
        return "bg-red-500"; // Highest priority
      case "B":
        return "bg-orange-500";
      case "C":
        return "bg-yellow-500";
      case "D":
        return "bg-blue-500";
      case "E":
        return "bg-green-500"; // Lowest priority
      default:
        return "bg-gray-500";
    }
  };

  // Sample points along the route and fetch alerts
  useEffect(() => {
    const fetchRouteAlerts = async () => {
      if (!route || route.path.length === 0) return;

      setLoading(true);

      try {
        // Sample points along the route (every 5th point)
        const sampledPoints = route.path.filter((_, index) => index);

        // Fetch 911 calls from our server API
        const response = await fetch(
          `http://localhost:5000/api/911calls?format=calls`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch 911 calls");
        }

        const data = await response.json();
        console.log(`Fetched ${data.totalCalls} 911 calls for route analysis`);

        // Filter alerts that are within 0.2 miles of any sampled point
        const nearbyAlerts = data.calls.filter((alert) => {
          // Check if alert is within 0.2 miles of any sampled point
          return sampledPoints.some((point) => {
            const distance = map.distance(
              [point[0], point[1]],
              [alert.latitude, alert.longitude]
            );
            // 0.2 miles = 321.869 meters
            return distance <= 321.869;
          });
        });

        console.log(`Found ${nearbyAlerts.length} 911 calls along the route`);
        setRouteAlerts(nearbyAlerts);
        
        // Call the callback to pass alerts to parent component
        if (onAlertsFound) {
          onAlertsFound(nearbyAlerts);
        }
        
        console.log(`Route alerts:`, nearbyAlerts);
      } catch (err) {
        console.error("Error fetching route alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteAlerts();

    // Set up polling to refresh data every 2 minutes
    const intervalId = setInterval(fetchRouteAlerts, 120 * 1000);

    return () => clearInterval(intervalId);
  }, [route, map, onAlertsFound]);

  if (loading) return null;

  return (
    <>
      {routeAlerts.map((alert) => (
        <Marker
          key={alert.id}
          position={[alert.latitude, alert.longitude]}
          icon={incidentIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-red-500">{alert.callType}</h3>
              <p className="text-sm">{alert.location}</p>
              <p className="text-xs text-gray-500">{alert.time}</p>
              <div className="text-xs mt-1">
                <p>
                  <span className="font-semibold">Priority:</span>{" "}
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-1 ${getPriorityColor(
                      alert.priority
                    )}`}
                  ></span>{" "}
                  {alert.priority}
                </p>
                <p>
                  <span className="font-semibold">Agency:</span> {alert.agency}
                </p>
                {alert.sensitive && (
                  <p className="text-red-500 font-semibold">Sensitive Call</p>
                )}
              </div>
              {alert.isFuture && (
                <p className="text-xs text-yellow-500 mt-1 italic">
                  Note: This is test data with a future date
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default function MySafeRoutes() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default center to SF
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showRouteAlerts, setShowRouteAlerts] = useState(true);
  const [expandedRouteIndex, setExpandedRouteIndex] = useState(null);
  const [routeAlerts, setRouteAlerts] = useState([]);

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
            console.error("Error getting location:", error);
            setLocationError(
              "Unable to get your location. Please enable location services."
            );
          }
        );
      } else {
        setLocationError("Geolocation is not supported by your browser.");
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
        const script = document.createElement("script");
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
      console.error("Google Maps API not loaded");
      return;
    }

    // Initialize origin autocomplete
    if (originInputRef.current) {
      originAutocompleteRef.current =
        new window.google.maps.places.Autocomplete(originInputRef.current, {
          componentRestrictions: { country: "us" },
          fields: ["address_components", "geometry", "formatted_address"],
          types: ["geocode"], // Use a single type to avoid the error
        });
      originAutocompleteRef.current.addListener("place_changed", () => {
        const place = originAutocompleteRef.current.getPlace();
        if (place.formatted_address) {
          setOrigin(place.formatted_address);
        }
      });
    }

    // Initialize destination autocomplete
    if (destinationInputRef.current) {
      destinationAutocompleteRef.current =
        new window.google.maps.places.Autocomplete(
          destinationInputRef.current,
          {
            componentRestrictions: { country: "us" },
            fields: ["address_components", "geometry", "formatted_address"],
            types: ["geocode"], // Use a single type to avoid the error
          }
        );
      destinationAutocompleteRef.current.addListener("place_changed", () => {
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
      const response = await fetch("http://localhost:5000/api/directions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

      // console.log("Routes:", JSON.stringify(allRoutes, null, 2));


      setRoutes(allRoutes);

      // Set start and end locations for markers
      setStartLocation(data.routes[0].legs[0].start_location);
      setEndLocation(data.routes[0].legs[0].end_location);

      // Center the map on the route bounds
      const bounds = data.routes[0].bounds;
      const center = [
        (bounds.northeast.lat + bounds.southwest.lat) / 2,
        (bounds.northeast.lng + bounds.southwest.lng) / 2,
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
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
  };

  const handleRouteSelect = (index) => {
    // Force re-render of the map by using a little state update trick
    setRoutes((prevRoutes) => {
      // No need to actually modify the routes, just return the same array
      // The key point is that calling this setter will trigger a re-render
      return [...prevRoutes];
    });

    // Update the selected route index
    setSelectedRouteIndex(index);

    // No longer automatically expand the route details
    // Only the toggle button should control this now

    // Log for debug
    console.log(`Selected route ${index} - should show as green`);
  };

  const toggleRouteExpansion = (index) => {
    setExpandedRouteIndex(expandedRouteIndex === index ? null : index);
  };

  // Function to fetch route alerts
  const fetchRouteAlerts = async (route) => {
    if (!route || !route.path || route.path.length === 0) return;

    try {
      // Sample points along the route (every 5th point)
      const sampledPoints = route.path.filter((_, index) => index % 5 === 0);

      // Fetch 911 calls from our server API
      const response = await fetch(
        `http://localhost:5000/api/911calls?format=calls`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch 911 calls");
      }

      const data = await response.json();
      console.log(`Fetched ${data.totalCalls} 911 calls for route analysis`);

      // Filter alerts that are within 0.2 miles of any sampled point
      const map = document.querySelector(".leaflet-container")?._leaflet_map;
      if (!map) return;

      const nearbyAlerts = data.calls.filter((alert) => {
        // Check if alert is within 0.2 miles of any sampled point
        return sampledPoints.some((point) => {
          const distance = map.distance(
            [point[0], point[1]],
            [alert.latitude, alert.longitude]
          );
          // 0.2 miles = 321.869 meters
          return distance <= 321.869;
        });
      });

      console.log(`Found ${nearbyAlerts.length} 911 calls along the route`);
      setRouteAlerts(nearbyAlerts);
      
    } catch (err) {
      console.error("Error fetching route alerts:", err);
    }
  };

  // Update route alerts when selected route changes
  useEffect(() => {
    if (routes.length > 0 && showRouteAlerts) {
      fetchRouteAlerts(routes[selectedRouteIndex]);
    }
  }, [selectedRouteIndex, routes, showRouteAlerts]);

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">
          🚍 SF Transit Directions
        </h1>

        <form
          onSubmit={handleFindRoute}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
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
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded"
          >
            {loading ? "Finding..." : "Get Directions"}
          </button>
        </form>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            {routes.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-yellow-400 mb-3">
                  Available Routes
                </h2>
                <div className="flex flex-col gap-3">
                  {routes.map((route, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 rounded-lg overflow-hidden"
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-5 h-5 rounded-full mr-3 transition-transform duration-300"
                            style={{
                              backgroundColor:
                                selectedRouteIndex === index
                                  ? SELECTED_ROUTE_COLOR
                                  : UNSELECTED_ROUTE_COLOR,
                              transform:
                                selectedRouteIndex === index
                                  ? "scale(1.2)"
                                  : "scale(1)",
                            }}
                          ></div>
                          <div>
                            <span className="font-medium text-lg">
                              Route {index + 1}
                            </span>
                            <span className="ml-2 text-sm text-gray-400">
                              ({route.distance} • {route.duration})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRouteSelect(index);
                            }}
                            className={`px-5 py-2.5 font-medium rounded-lg shadow-lg transition-all duration-300 
                              ${
                                selectedRouteIndex === index
                                  ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white transform scale-105 border-2 border-emerald-300"
                                  : "bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white border-2 border-gray-700 hover:border-teal-500"
                              }
                              hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 active:scale-95`}
                          >
                            {selectedRouteIndex === index
                              ? "✓ Selected"
                              : "Select Route"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRouteExpansion(index);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 transform hover:scale-105 active:scale-95 shadow-lg text-black"
                            aria-label="Toggle route details"
                          >
                            <span
                              className={`font-medium transition-transform duration-300 inline-block ${
                                expandedRouteIndex === index
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            >
                              ▼
                            </span>
                            <span className="font-medium">Expand</span>
                          </button>
                        </div>
                      </div>

                      {expandedRouteIndex === index && (
                        <div className="p-4 border-t border-gray-700">
                          {route.warnings.length > 0 && (
                            <div className="bg-yellow-900 text-yellow-200 p-3 rounded-lg mb-4">
                              <h3 className="font-semibold">Warnings:</h3>
                              <ul className="list-disc pl-4">
                                {route.warnings.map((warning, idx) => (
                                  <li key={idx}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="space-y-2">
                            {route.steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="bg-gray-700 p-3 rounded-lg"
                              >
                                <p className="text-sm text-gray-200 mb-1">
                                  <strong>{step.index}.</strong>{" "}
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: step.instruction,
                                    }}
                                  />
                                </p>
                                <div className="text-xs text-gray-400 mt-1">
                                  Distance: {step.distance} • Duration:{" "}
                                  {step.duration}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-[500px] rounded-xl overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={13}
                className="h-full w-full z-0"
                key={`${mapCenter.join(",")}-${selectedRouteIndex}`}
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
                      color:
                        selectedRouteIndex === index
                          ? SELECTED_ROUTE_COLOR
                          : UNSELECTED_ROUTE_COLOR,
                      weight: selectedRouteIndex === index ? 6 : 3,
                      opacity: selectedRouteIndex === index ? 1 : 0.7,
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

                {showRouteAlerts && routes.length > 0 && (
                  <RouteAlerts 
                    route={routes[selectedRouteIndex]} 
                    onAlertsFound={setRouteAlerts}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-yellow-400">
                  Safety Alerts
                </h2>
                <button
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                >
                  {showAlerts ? "Hide" : "Show"}
                </button>
              </div>

              {locationError && (
                <div className="bg-red-900 text-red-200 p-3 rounded-lg mb-4">
                  <p>{locationError}</p>
                  <p className="text-sm mt-2">
                    Enable location services to see nearby alerts.
                  </p>
                </div>
              )}

              {showAlerts && userLocation ? (
                <div className="text-gray-300">
                  <p>
                    Alerts are displayed on the map. Toggle the "Show" button to
                    show/hide alerts.
                  </p>
                </div>
              ) : (
                <p className="text-gray-300">
                  Enable location services to see nearby alerts.
                </p>
              )}
            </div>

            {routes.length > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-yellow-400">
                    Route Alerts
                  </h2>
                  <button
                    onClick={() => setShowRouteAlerts(!showRouteAlerts)}
                    className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                  >
                    {showRouteAlerts ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-gray-300">
                  Shows 911 calls within 0.2 miles of points along your selected
                  route.
                </p>
              </div>
            )}

            {routes.length > 0 && (
              <div className="mt-4">
                <RouteAssistant
                  selectedRoute={routes[selectedRouteIndex]}
                  routeAlerts={routeAlerts}
                  userLocation={userLocation}
                  startLocation={startLocation}
                  endLocation={endLocation}
                  expandedRouteIndex={expandedRouteIndex}
                  allRoutes={routes}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
