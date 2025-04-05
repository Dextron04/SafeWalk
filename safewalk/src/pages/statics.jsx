import React from 'react';
import { motion } from 'framer-motion';
import chart from '../assets/output.png';

export default function Statics() {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl text-yellow-400 font-extrabold text-center">📊 Why SafeWalk is Important</h1>

        <motion.div
          className="bg-gray-800 p-6 rounded-xl shadow-xl space-y-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-semibold text-yellow-300">🚶‍♂️ United States</h2>
          <p>In the first half of 2024 alone, over <span className="font-bold text-yellow-400">3,300 pedestrian deaths</span> were reported. This is a <span className="text-red-500 font-bold">48% increase</span> from 2014.</p>
        </motion.div>

        <motion.div
          className="bg-gray-800 p-6 rounded-xl shadow-xl space-y-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-blue-300">🌍 Global Comparison</h2>
          <p>Other countries with walkable cities report <span className="text-green-400 font-bold">50-70% fewer incidents</span>. For example, Norway and Sweden are almost at <span className="font-bold text-green-300">zero pedestrian deaths</span> per year.</p>
        </motion.div>

        <div className="text-center">
          <img src={chart} alt="Pedestrian Death Stats Chart" className="mx-auto rounded-xl shadow-lg border border-gray-600" />
        </div>

        <footer className="text-center text-gray-500 pt-6 border-t border-gray-700 text-sm">
          Sources: GHSA, WHO, USDOT | Designed for SafeWalk 🚶
        </footer>
      </div>
    </div>
  );
}
