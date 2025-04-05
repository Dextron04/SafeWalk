import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    show: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.6,
      },
    }),
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen px-6 py-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header Section */}
        <motion.div
          className="text-center space-y-4"
          initial="hidden"
          animate="show"
          variants={fadeIn}
        >
          <h1 className="text-5xl font-extrabold text-yellow-400">🛡️ Welcome to SafeWalk</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            SafeWalk is your real-time, community-driven safety navigator. It alerts users to danger zones,
            suggests safe paths, and leverages open data and reports to protect you — whether you walk alone at night or commute daily.
          </p>
        </motion.div>

        {/* Why it matters */}
        <motion.div
          className="bg-gray-800 border border-gray-700 rounded-2xl p-6 text-center shadow-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl text-yellow-300 font-bold mb-3">🚨 Why SafeWalk is Needed</h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            In 2024 alone, <span className="text-yellow-400 font-bold">3,300+ pedestrian deaths</span> were reported in the U.S. —
            a 48% increase since 2014. Poor lighting, isolated routes, and unreported crime zones continue to threaten daily commuters.
            SafeWalk is here to change that.
          </p>
        </motion.div>

        {/* Core Features */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: '📍 Real-Time Crime Awareness',
              desc: 'We pull data from public APIs and users to help you avoid danger zones before stepping outside.',
              color: 'bg-pink-500',
            },
            {
              title: '🌕 Contextual Safety Insights',
              desc: 'We guide you using lighting, crowds, and open spaces — not just roads — for the safest experience.',
              color: 'bg-yellow-400 text-black',
            },
            {
              title: '👥 Crowd-Sourced Alerts',
              desc: 'Users drop live alerts about unsafe activity — creating a trusted community shield.',
              color: 'bg-purple-500',
            },
            {
              title: '🚀 Growing Impact',
              desc: 'Thousands use SafeWalk weekly in major U.S. cities. Together, we’re building a safer future.',
              color: 'bg-pink-600',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className={`rounded-xl p-5 ${item.color} shadow-lg`}
              variants={fadeIn}
              initial="hidden"
              animate="show"
              custom={i + 1}
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-white">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* User Impact Section */}
        <motion.div
          className="bg-gray-800 border border-gray-700 p-6 rounded-2xl text-center shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-bold text-blue-300 mb-2">💬 Trusted by Communities</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            “I used to avoid night walks in my city. SafeWalk helped me feel confident again. The alerts are accurate and timely!”<br />
            <span className="italic text-sm text-gray-500">— Jasmine R., San Francisco</span>
          </p>
        </motion.div>

        {/* Call-to-Actions */}
        <div className="flex flex-wrap justify-center gap-6">
          <motion.button
            onClick={() => navigate('/map')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full transition-all shadow-lg"
            whileTap={{ scale: 0.95 }}
          >
            🗺️ View Map
          </motion.button>
          <motion.button
            onClick={() => navigate('/statistics')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg"
            whileTap={{ scale: 0.95 }}
          >
            📊 View Statistics
          </motion.button>
          <motion.button
            onClick={() => navigate('/help')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-all shadow-lg"
            whileTap={{ scale: 0.95 }}
          >
            🆘 Emergency Help
          </motion.button>
        </div>
      </div>
    </div>
  );
}
