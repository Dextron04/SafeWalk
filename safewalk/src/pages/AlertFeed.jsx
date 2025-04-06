import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {},
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
    const locationInterval = setInterval(getUserLocation, 60000);
    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/911calls?format=calls`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch 911 calls: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Fetched ${data.totalCalls} 911 calls from server API`);

        const hasFutureData = data.calls.some((alert) => alert.isFuture);
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
    const intervalId = setInterval(fetchCalls, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'A':
        return 'bg-red-500';
      case 'B':
        return 'bg-orange-500';
      case 'C':
        return 'bg-yellow-500';
      case 'D':
        return 'bg-blue-500';
      case 'E':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAlertClick = (alert) => {
    navigate('/routes', {
      state: {
        incidentLocation: { lat: alert.latitude, lng: alert.longitude },
        incidentDetails: alert,
      },
    });
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2 sm:mb-4">🗞️ Live Safety Alerts</h1>
        <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
          Real-time alerts from 911 calls in San Francisco.
        </p>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
            <p className="mt-2 text-gray-400">Loading 911 calls...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-xl mb-6 text-sm sm:text-base">
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-start">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 sm:mt-2 mr-3 ${getPriorityColor(alert.priority)}`}
                    ></div>
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-red-300">{alert.callType}</h2>
                      {alert.callTypeOriginal && alert.callTypeOriginal !== alert.callType && (
                        <p className="text-sm text-gray-300">
                          Originally: {alert.callTypeOriginal}
                        </p>
                      )}
                      <p className="text-sm sm:text-base text-gray-300 mt-1">📍 {alert.location}</p>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <p>
                          <span className="font-semibold">Priority:</span> {alert.priority}
                        </p>
                        <p>
                          <span className="font-semibold">Agency:</span> {alert.agency}
                        </p>
                        {alert.sensitive && (
                          <p className="text-red-500 font-semibold">Sensitive Call</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-400">{alert.time}</span>
                </div>
                {alert.isFuture && (
                  <p className="text-xs text-yellow-500 mt-2 italic">
                    Note: This is test data with a future date
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
