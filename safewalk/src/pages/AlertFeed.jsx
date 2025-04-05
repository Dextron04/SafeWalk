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

  // Fetch 911 calls from the server API
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);

        // Query for 911 calls from our server API
        const response = await fetch(
          `http://localhost:5000/api/911calls?format=calls`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch 911 calls: ${response.status} ${response.statusText}`);
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
        setError('Failed to load 911 call data. Please try again later.');
      } finally {
        setLoading(false);
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

  // Navigate to map with this call
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
        <p className="text-gray-400 mb-6">Real-time alerts from 911 calls in San Francisco.</p>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
            <p className="mt-2 text-gray-400">Loading 911 calls...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-xl mb-6">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="bg-gray-800 p-6 rounded-xl text-center">
            <p className="text-gray-300">No 911 calls reported at this time.</p>
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
                    <div className={`w-3 h-3 rounded-full mt-2 mr-3 ${getPriorityColor(alert.priority)}`}></div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-300">{alert.callType}</h2>
                      {alert.callTypeOriginal && alert.callTypeOriginal !== alert.callType && (
                        <p className="text-sm text-gray-300">Originally: {alert.callTypeOriginal}</p>
                      )}
                      <p className="text-gray-300 mt-1">📍 {alert.location}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        <p><span className="font-semibold">Priority:</span> {alert.priority}</p>
                        <p><span className="font-semibold">Agency:</span> {alert.agency}</p>
                        {alert.sensitive && <p className="text-red-500 font-semibold">Sensitive Call</p>}
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
