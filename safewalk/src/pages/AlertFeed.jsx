import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get user's current location
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            // Just checking if we can get location
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Unable to get your location. Please enable location services.');
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
      }
    };

    getUserLocation();

    // Set up periodic location updates
    const locationInterval = setInterval(getUserLocation, 60000); // Update every minute

    return () => clearInterval(locationInterval);
  }, []);

  // Fetch incidents from the SFPD API
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
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

        // Process incidents with raw data
        const processedAlerts = data
          .filter(incident => incident.latitude && incident.longitude) // Only include incidents with coordinates
          .map(incident => ({
            id: incident.incident_id,
            time: formatIncidentDate(incident.incident_datetime),
            rawTime: new Date(incident.incident_datetime).getTime(), // Store raw timestamp for sorting
            location: incident.intersection || incident.police_district,
            category: incident.incident_category,
            subcategory: incident.incident_subcategory,
            description: incident.incident_description,
            resolution: incident.resolution,
            neighborhood: incident.analysis_neighborhood,
            district: incident.police_district,
            latitude: parseFloat(incident.latitude),
            longitude: parseFloat(incident.longitude),
            isFuture: new Date(incident.incident_datetime) > today,
            // Include additional fields from the raw data
            incident_datetime: incident.incident_datetime,
            incident_date: incident.incident_date,
            incident_time: incident.incident_time,
            incident_year: incident.incident_year,
            incident_day_of_week: incident.incident_day_of_week,
            report_datetime: incident.report_datetime,
            incident_number: incident.incident_number,
            cad_number: incident.cad_number,
            report_type_description: incident.report_type_description
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
            category: mostRecent.category,
            isFuture: mostRecent.isFuture
          });
        }

        setAlerts(processedAlerts);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError('Failed to load incident data. Please try again later.');
      } finally {
        setLoading(false);
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

  // Get severity level based on incident category
  const getSeverityLevel = (category) => {
    const highSeverity = ['Assault', 'Robbery', 'Homicide', 'Rape', 'Weapons'];
    const mediumSeverity = ['Larceny Theft', 'Drug Offense', 'Vehicle Impounded'];
    const lowSeverity = ['Lost Property', 'Non-Criminal', 'Recovered Vehicle'];

    if (highSeverity.some(term => category.includes(term))) return 'high';
    if (mediumSeverity.some(term => category.includes(term))) return 'medium';
    if (lowSeverity.some(term => category.includes(term))) return 'low';
    return 'unknown';
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Navigate to map with this incident
  const handleAlertClick = (alert) => {
    navigate('/routes', {
      state: {
        incidentLocation: { lat: alert.latitude, lng: alert.longitude },
        incidentDetails: alert
      }
    });
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">🗞️ Live Safety Alerts</h1>
        <p className="text-gray-400 mb-6">Real-time alerts from SFPD incident reports.</p>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
            <p className="mt-2 text-gray-400">Loading incidents...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-xl mb-6">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-gray-300">No incidents reported at this time.</p>
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md cursor-pointer hover:bg-gray-700"
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className={`w-3 h-3 rounded-full mt-2 mr-3 ${getSeverityColor(getSeverityLevel(alert.category))}`}></div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-300">{alert.category}</h2>
                      {alert.subcategory && <p className="text-sm text-gray-300">{alert.subcategory}</p>}
                      <p className="text-gray-300 mt-1">📍 {alert.location}</p>
                      <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        <p>Neighborhood: {alert.neighborhood}</p>
                        <p>District: {alert.district}</p>
                        <p>Resolution: {alert.resolution}</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{alert.time}</span>
                </div>
                {alert.isFuture && (
                  <p className="text-xs text-yellow-500 mt-2 italic">Note: This is test data with a future date</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
