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

    // Fetch 911 calls from the API
    useEffect(() => {
        const fetchCalls = async () => {
            try {
                // Get current date for comparison
                const today = new Date();

                // Query for 911 calls, ordered by most recent
                const response = await fetch(
                    `https://data.sfgov.org/resource/gnap-fj3t.json?$order=received_datetime DESC`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch 911 calls');
                }

                const data = await response.json();
                console.log(`Fetched ${data.length} 911 calls from API`);

                // Check if we have future-dated data (test data)
                const hasFutureData = data.some(call => {
                    const callDate = new Date(call.received_datetime);
                    return callDate > today;
                });

                if (hasFutureData) {
                    console.log('Detected future-dated data in the API response (likely test data)');
                }

                // Process calls with raw data
                const processedAlerts = data
                    .filter(call => call.intersection_point && call.intersection_point.coordinates) // Only include calls with coordinates
                    .map(call => ({
                        id: call.id,
                        time: formatCallDate(call.received_datetime),
                        rawTime: new Date(call.received_datetime).getTime(), // Store raw timestamp for sorting
                        location: call.intersection_name || 'Unknown Location',
                        callType: call.call_type_final_desc,
                        callTypeOriginal: call.call_type_original_desc,
                        priority: call.priority_final,
                        agency: call.agency,
                        sensitive: call.sensitive_call,
                        latitude: call.intersection_point.coordinates[1],
                        longitude: call.intersection_point.coordinates[0],
                        isFuture: new Date(call.received_datetime) > today,
                        // Include additional fields from the raw data
                        received_datetime: call.received_datetime,
                        entry_datetime: call.entry_datetime,
                        dispatch_datetime: call.dispatch_datetime,
                        enroute_datetime: call.enroute_datetime,
                        cad_number: call.cad_number,
                        onview_flag: call.onview_flag
                    }))
                    .sort((a, b) => b.rawTime - a.rawTime); // Sort by most recent using raw timestamp

                console.log(`Processed ${processedAlerts.length} 911 calls with valid coordinates`);

                // Log the most recent call for debugging
                if (processedAlerts.length > 0) {
                    const mostRecent = processedAlerts[0];
                    console.log('Most recent 911 call:', {
                        id: mostRecent.id,
                        time: mostRecent.time,
                        rawTime: new Date(mostRecent.rawTime).toISOString(),
                        callType: mostRecent.callType,
                        isFuture: mostRecent.isFuture
                    });
                }

                setAlerts(processedAlerts);
            } catch (err) {
                console.error('Error fetching 911 calls:', err);
            }
        };

        fetchCalls();

        // Set up polling to refresh data every 1 minute (more frequent updates)
        const intervalId = setInterval(fetchCalls, 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Format call date for display
    const formatCallDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

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