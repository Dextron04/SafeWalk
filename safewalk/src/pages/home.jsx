import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen px-6 py-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl font-extrabold text-yellow-400 mb-3 drop-shadow"
          >
            🛡️ Welcome to SafeWalk
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            A real-time, crowd-sourced safety navigation app built to protect you while walking — day or night.
          </motion.p>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3 }}
          className="bg-gray-700/40 border border-gray-600 backdrop-blur-lg p-6 md:p-10 rounded-3xl shadow-lg"
        >
          <h2 className="text-3xl font-bold text-yellow-300 mb-5">🚨 Why SafeWalk?</h2>
          <p className="text-lg text-gray-200 leading-relaxed mb-3">
            Pedestrian safety is a growing concern in the U.S. In the first half of 2024, drivers struck and killed
            <span className="font-bold text-yellow-400"> 3,304 pedestrians</span> — a 48% increase compared to 2014.
          </p>
          <p className="text-sm text-blue-400">
            Source:{' '}
            <a
              href="https://ghsa.org/resource-hub/pedestrian-traffic-fatalities-january-june-2024"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              GHSA Report 2024
            </a>
          </p>
        </motion.section>

        <section className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: '📍 Real-Time Crime Awareness',
              desc: 'We pull data from open crime databases and community reports to help you avoid danger zones before you even step outside.',
            },
            {
              title: '🌕 Contextual Safety Insights',
              desc: 'Our maps factor in lighting, crowds, and public areas — not just roads — to guide you through the safest paths, not just the shortest.',
            },
            {
              title: '👥 Crowd-Sourced Alerts',
              desc: 'Users can drop live alerts about suspicious activity or unsafe areas, creating a safety network you can trust.',
            },
            {
              title: '🤝 Community Impact',
              desc: 'By participating, you’re helping build a community-based safety net that could reduce preventable incidents across cities.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * i }}
              className="bg-gray-700/40 p-6 rounded-2xl border border-gray-600 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-2xl font-semibold text-yellow-300 mb-2">{item.title}</h3>
              <p className="text-gray-200">{item.desc}</p>
            </motion.div>
          ))}
        </section>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/map')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-lg py-3 px-6 rounded-full transition-all shadow-md"
          >
            🗺️ View SafeWalk Map
          </button>
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="text-center text-sm text-gray-400 pt-10 border-t border-gray-600"
        >
          🚶‍♂️ Stay safe. Stay aware. Choose <span className="text-yellow-400 font-medium">SafeWalk</span> for your journeys.
        </motion.footer>
      </div>
    </div>
  );
}
