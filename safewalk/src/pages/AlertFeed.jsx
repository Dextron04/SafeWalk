import React, { useEffect, useState } from 'react';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([
    { id: 1, time: 'Just now', location: 'Downtown SF', type: '🚨 Suspicious Activity' },
    { id: 2, time: '1 min ago', location: 'Mission District', type: '💡 Low Lighting Area' },
  ]);

  // Simulate new alerts every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = {
        id: alerts.length + 1,
        time: 'A few seconds ago',
        location: getRandomLocation(),
        type: getRandomType(),
      };
      setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]); // Limit to 10 alerts max
    }, 10000);
    return () => clearInterval(interval);
  }, [alerts]);

  const getRandomLocation = () => {
    const locations = ['Union Square', 'Market & 7th', 'Powell Station', 'Chinatown'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getRandomType = () => {
    const types = ['🚨 Suspicious Activity', '💡 Low Lighting Area', '👮‍♂️ Police Spotted', '🗣️ Loud Argument'];
    return types[Math.floor(Math.random() * types.length)];
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6">🗞️ Live Community Alerts</h1>
        <p className="text-gray-400 mb-6">Auto-updating safety alerts from the community.</p>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-red-300">{alert.type}</span>
                <span className="text-sm text-gray-400">{alert.time}</span>
              </div>
              <p className="text-gray-300 mt-1">📍 {alert.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
