import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import React from 'react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-950 text-white min-h-screen px-6 py-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        <motion.h1
          className="text-5xl font-extrabold text-yellow-400 text-center"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🛡️ Welcome to SafeWalk
        </motion.h1>

        <motion.p
          className="text-lg text-gray-300 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          SafeWalk is your real-time, community-driven safety navigator. It alerts users to danger zones, suggests safe paths, and leverages open data and reports to protect you — whether you walk alone at night or commute daily.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: '📍 Real-Time Crime Awareness',
              desc: 'We pull data from public APIs and users to help you avoid danger zones before stepping outside.',
            },
            {
              title: '🌕 Contextual Safety Insights',
              desc: 'We guide you using lighting, crowds, and open spaces — not just roads — for the safest experience.',
            },
            {
              title: '👥 Crowd-Sourced Alerts',
              desc: 'Users drop live alerts about unsafe activity — creating a trusted community shield.',
            },
            {
              title: '🚀 Growing Impact',
              desc: 'Thousands use SafeWalk weekly in major U.S. cities. Together, we’re building a safer future.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-gray-800 p-6 rounded-xl border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <h3 className="text-2xl font-semibold text-yellow-300 mb-2">{item.title}</h3>
              <p className="text-gray-200">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/map')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-full shadow"
          >
            🗺️ View Map
          </button>
          <button
            onClick={() => navigate('/statistics')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow"
          >
            📊 View Statistics
          </button>
        </div>
      </div>
    </div>
  );
}
