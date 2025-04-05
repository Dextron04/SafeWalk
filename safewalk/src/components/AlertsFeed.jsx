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

    // Fetch incidents from the SFPD API
    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                // Get current date for comparison
                const today = new Date();

                // Query for incidents, ordered by most recent
                const response = await fetch(
                    `https://data.sfgov.org/resource/wg3w-h783.json?$order=incident_datetime DESC&$limit=100`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch incidents');
                }

                const data = await response.json();
                console.log(`Fetched ${data.length} incidents from SFPD API`);

                // Check if we have future-dated data (test data)
                const hasFutureData = data.some(incident => {
                    const incidentDate = new Date(incident.incident_datetime);
                    return incidentDate > today;
                });

                if (hasFutureData) {
                    console.log('Detected future-dated data in the API response (likely test data)');
                }

                // Filter and process incidents
                const processedAlerts = data
                    .filter(incident => incident.latitude && incident.longitude) // Only include incidents with coordinates
                    .map(incident => ({
                        id: incident.incident_id,
                        time: formatIncidentDate(incident.incident_datetime),
                        rawTime: new Date(incident.incident_datetime).getTime(), // Store raw timestamp for sorting
                        location: incident.intersection || incident.police_district,
                        type: getIncidentType(incident.incident_category),
                        category: incident.incident_category,
                        description: incident.incident_description,
                        latitude: parseFloat(incident.latitude),
                        longitude: parseFloat(incident.longitude),
                        severity: getSeverityLevel(incident.incident_category),
                        isFuture: new Date(incident.incident_datetime) > today
                    }))
                    .sort((a, b) => b.rawTime - a.rawTime); // Sort by most recent using raw timestamp

                console.log(`Processed ${processedAlerts.length} incidents with valid coordinates`);

                // Log the most recent incident for debugging
                if (processedAlerts.length > 0) {
                    const mostRecent = processedAlerts[0];
                    console.log('Most recent incident:', {
                        id: mostRecent.id,
                        time: mostRecent.time,
                        rawTime: new Date(mostRecent.rawTime).toISOString(),
                        type: mostRecent.type,
                        isFuture: mostRecent.isFuture
                    });
                }

                setAlerts(processedAlerts);
            } catch (err) {
                console.error('Error fetching incidents:', err);
            }
        };

        fetchIncidents();

        // Set up polling to refresh data every 1 minute (more frequent updates)
        const intervalId = setInterval(fetchIncidents, 60 * 1000);

        return () => clearInterval(intervalId);
    }, []);

    // Format incident date for display
    const formatIncidentDate = (dateString) => {
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

    // Get incident type with emoji
    const getIncidentType = (category) => {
        const typeMap = {
            'Assault': '🚨 Assault',
            'Robbery': '🚨 Robbery',
            'Homicide': '🚨 Homicide',
            'Rape': '🚨 Sexual Assault',
            'Weapons': '🔫 Weapons',
            'Larceny Theft': '💰 Theft',
            'Drug Offense': '💊 Drug Activity',
            'Vehicle Impounded': '🚗 Vehicle Impounded',
            'Lost Property': '🔍 Lost Property',
            'Non-Criminal': 'ℹ️ Non-Criminal',
            'Recovered Vehicle': '🚗 Recovered Vehicle',
            'Suspicious Occ': '👀 Suspicious Activity',
            'Mental Health': '🧠 Mental Health',
            'Dog, Bite or Attack': '🐕 Dog Incident'
        };

        // Find the matching category
        for (const [key, value] of Object.entries(typeMap)) {
            if (category.includes(key)) return value;
        }

        return `ℹ️ ${category}`;
    };

    // Get severity level
    const getSeverityLevel = (category) => {
        const highSeverity = ['Assault', 'Robbery', 'Homicide', 'Rape', 'Weapons'];
        const mediumSeverity = ['Larceny Theft', 'Drug Offense', 'Vehicle Impounded'];
        const lowSeverity = ['Lost Property', 'Non-Criminal', 'Recovered Vehicle'];

        if (highSeverity.some(term => category.includes(term))) return 'high';
        if (mediumSeverity.some(term => category.includes(term))) return 'medium';
        if (lowSeverity.some(term => category.includes(term))) return 'low';
        return 'unknown';
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

    console.log(`Showing ${nearbyAlerts.length} alerts within 1 mile of user location`);

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

            {/* Display markers for nearby incidents */}
            {nearbyAlerts.map(alert => (
                <Marker
                    key={alert.id}
                    position={[alert.latitude, alert.longitude]}
                    icon={incidentIcon}
                >
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold text-red-500">{alert.type}</h3>
                            <p className="text-sm">{alert.location}</p>
                            <p className="text-xs text-gray-500">{alert.time}</p>
                            <p className="text-sm mt-1">{alert.description}</p>
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