import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      time: 'Just now',
      location: 'Union Square',
      type: '🚨 Suspicious Activity',
    },
  ]);

  // Simulate real-time alert generation
  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = {
        id: Date.now(),
        time: generateTime(),
        location: getRandomLocation(),
        type: getRandomType(),
      };

      setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]); // keep max 10 alerts
    }, 7000); // every 7 seconds

    return () => clearInterval(interval);
  }, []);

  const getRandomLocation = () => {
    const locations = ['Downtown SF', 'Powell Station', 'Market & 7th', 'Mission Street', 'Chinatown'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getRandomType = () => {
    const types = [
      '🚨 Suspicious Activity',
      '👥 Group Gathering',
      '💡 Poor Lighting',
      '👮‍♂️ Police Presence',
      '🗣️ Loud Altercation',
      '🐕 Stray Animal Spotted',
    ];
    return types[Math.floor(Math.random() * types.length)];
  };

  const generateTime = () => {
    const minutes = Math.floor(Math.random() * 5);
    return minutes === 0 ? 'Just now' : `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-8 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">🗞️ Live Safety Alerts</h1>
        <p className="text-gray-400 mb-6">Auto-updating alerts from nearby zones.</p>

        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-red-300">{alert.type}</h2>
                  <span className="text-sm text-gray-400">{alert.time}</span>
                </div>
                <p className="text-gray-300 mt-1">📍 {alert.location}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
