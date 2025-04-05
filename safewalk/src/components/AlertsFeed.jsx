import React, { useEffect, useState } from 'react';
import { Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom marker icon for incidents
const incidentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function AlertsFeed({ userLocation }) {
    const [alerts, setAlerts] = useState([]);
    const map = useMap();

    // Fetch 911 calls from the server API
    useEffect(() => {
        const fetchCalls = async () => {
            try {
                // Query for 911 calls from our server API
                const response = await fetch(
                    `http://localhost:5000/api/911calls?format=calls`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch 911 calls');
                }

                const data = await response.json();
                console.log(`Fetched ${data.totalCalls} 911 calls from server API`);

                // Check if we have future-dated data (test data)
                const hasFutureData = data.calls.some(alert => alert.isFuture);

                if (hasFutureData) {
                    console.log('Detected future-dated data in the API response (likely test data)');
                }

                setAlerts(data.calls);
            } catch (err) {
                console.error('Error fetching 911 calls:', err);
            }
        };

        fetchCalls();

        // Set up polling to refresh data every 1 minute (more frequent updates)
        const intervalId = setInterval(fetchCalls, 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'A': return 'bg-red-500'; // Highest priority
            case 'B': return 'bg-orange-500';
            case 'C': return 'bg-yellow-500';
            case 'D': return 'bg-blue-500';
            case 'E': return 'bg-green-500'; // Lowest priority
            default: return 'bg-gray-500';
        }
    };

    // Filter alerts within 1 mile of user location
    const nearbyAlerts = userLocation ? alerts.filter(alert => {
        const distance = map.distance(
            [userLocation.lat, userLocation.lng],
            [alert.latitude, alert.longitude]
        );
        // 1 mile = 1609.34 meters
        return distance <= 1609.34;
    }) : [];

    console.log(`Showing ${nearbyAlerts.length} 911 calls within 1 mile of user location`);

    return (
        <>
            {/* Draw a circle representing the 1-mile radius */}
            {userLocation && (
                <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={1609.34} // 1 mile in meters
                    pathOptions={{ color: 'rgba(255, 255, 0, 0.2)', fillColor: 'rgba(255, 255, 0, 0.1)' }}
                />
            )}

            {/* Display markers for nearby 911 calls */}
            {nearbyAlerts.map(alert => (
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
                                <p><span className="font-semibold">Priority:</span> <span className={`inline-block w-3 h-3 rounded-full mr-1 ${getPriorityColor(alert.priority)}`}></span> {alert.priority}</p>
                                <p><span className="font-semibold">Agency:</span> {alert.agency}</p>
                                {alert.sensitive && <p className="text-red-500 font-semibold">Sensitive Call</p>}
                            </div>
                            {alert.isFuture && (
                                <p className="text-xs text-yellow-500 mt-1 italic">Note: This is test data with a future date</p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
} 