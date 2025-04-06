import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'A': return 'bg-red-500';
      case 'B': return 'bg-orange-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-blue-500';
      case 'E': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Fetch data
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);

        console.log('Fetching 911 calls from server API');
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        // Add more detailed error logging
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/911calls?format=calls`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch 911 calls: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        // Sort alerts by priority (A first, then B, etc.)
        const sortedAlerts = (data.calls || []).sort((a, b) => {
          const priorityOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
          return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
        });
        
        setAlerts(sortedAlerts);
      } catch (err) {
        console.error('Error details:', err);
        setError(`Failed to load 911 call data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
    const intervalId = setInterval(fetchCalls, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-gray-950 text-white min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4 flex items-center gap-2">📰 Live Safety Alerts</h1>
        <p className="text-gray-400 mb-6">Real-time alerts from 911 calls in San Francisco.</p>

        {/* Content */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-yellow-400 rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading 911 calls...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 text-red-200 p-4 rounded-xl mb-6 text-sm sm:text-base">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="bg-gray-800 p-6 rounded-xl text-center text-gray-300">
            No alerts available at this time.
          </div>
        )}

        {!loading && !error && alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 hover:bg-gray-700 transition-all p-4 rounded-lg shadow border border-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full mt-1.5 ${getPriorityColor(alert.priority)}`}></span>
                      <h3 className="font-bold text-red-300 text-sm md:text-base">{alert.callType}</h3>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1 ml-5">📍 {alert.location}</p>
                  <div className="text-xs text-gray-400 mt-1 ml-5">
                    <p><strong>Priority:</strong> {alert.priority || 'Unknown'}</p>
                    <p><strong>Agency:</strong> {alert.agency}</p>
                    {alert.sensitive && (
                      <p className="text-red-500 font-semibold">Sensitive Call</p>
                    )}
                    {alert.isFuture && (
                      <p className="text-yellow-500 italic mt-1">Test Data - Future Timestamp</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
