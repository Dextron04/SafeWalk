import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('All');
  const [agencyFilter, setAgencyFilter] = useState('All');
  const [callTypeFilter, setCallTypeFilter] = useState('All');
  const [filteredAlerts, setFilteredAlerts] = useState([]);

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

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/911calls?format=calls`);
        if (!response.ok) throw new Error('Failed to fetch 911 calls');
        const data = await response.json();
        console.log('Data received:', data);
        
        // Sort alerts by priority (A first, then B, etc.)
        const sortedAlerts = (data.calls || []).sort((a, b) => {
          const priorityOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5 };
          return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
        });
        
        setAlerts(sortedAlerts);
      } catch (err) {
        console.error(err);
        setError('Failed to load 911 call data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
    const intervalId = setInterval(fetchCalls, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const now = new Date();

    const filtered = alerts.filter((alert) => {
      let minutesAgo = 0;

      if (alert.timestamp || alert.created) {
        const alertTime = new Date(alert.timestamp || alert.created);
        minutesAgo = (now - alertTime) / (1000 * 60);
      } else if (alert.time && alert.time.includes('mins')) {
        const match = alert.time.match(/(\d+)/);
        minutesAgo = match ? parseInt(match[1]) : 0;
      } else {
        minutesAgo = 0; // Treat unknown time as recent
      }

      return (
        (timeRange === 'All' || minutesAgo <= parseInt(timeRange)) &&
        (agencyFilter === 'All' || alert.agency === agencyFilter) &&
        (callTypeFilter === 'All' || alert.callType === callTypeFilter)
      );
    });

    setFilteredAlerts(filtered);
  }, [alerts, timeRange, agencyFilter, callTypeFilter]);

  const groupedAlerts = filteredAlerts.reduce((groups, alert) => {
    const key = alert.priority || 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(alert);
    return groups;
  }, {});

  const priority = ['A', 'B', 'C', 'D', 'E'];

  const allAgencies = ['All', ...new Set(alerts.map((a) => a.agency).filter(Boolean))];
  const allCallTypes = ['All', ...new Set(alerts.map((a) => a.callType).filter(Boolean))];

  return (
    <div className="bg-gray-950 text-white min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4 flex items-center gap-2">📰 Live Safety Alerts</h1>
        <p className="text-gray-400 mb-6">Real-time alerts from 911 calls in San Francisco.</p>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-xl mb-8 flex flex-wrap gap-4 items-center text-sm sm:text-base">
          <div>
            <label className="text-gray-300 font-semibold">Time Range: </label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="ml-2 p-1 bg-gray-700 text-white rounded">
              <option value="All">All</option>
              <option value="30">Last 30 mins</option>
              <option value="60">Last 1 hour</option>
              <option value="120">Last 2 hours</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold">Agency: </label>
            <select value={agencyFilter} onChange={(e) => setAgencyFilter(e.target.value)} className="ml-2 p-1 bg-gray-700 text-white rounded">
              {allAgencies.map((agency, i) => (
                <option key={i} value={agency}>{agency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-300 font-semibold">Call Type: </label>
            <select value={callTypeFilter} onChange={(e) => setCallTypeFilter(e.target.value)} className="ml-2 p-1 bg-gray-700 text-white rounded">
              {allCallTypes.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <AnimatePresence>
                      {groupedAlerts[priority].map((alert) => (
                        <motion.div
                          key={alert.id || `${alert.callType}-${alert.location}-${priority}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gray-800 hover:bg-gray-700 transition-all p-4 rounded-lg shadow border border-gray-700"
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-red-300 text-sm md:text-base">{alert.callType}</h3>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{alert.time}</span>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">📍 {alert.location}</p>
                          <p className="text-xs text-gray-400 mt-1"><strong>Agency:</strong> {alert.agency}</p>
                          {alert.sensitive && (
                            <p className="text-xs text-red-500 font-semibold">Sensitive Call</p>
                          )}
                          {alert.isFuture && (
                            <p className="text-xs text-yellow-500 italic mt-1">Test Data - Future Timestamp</p>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
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
