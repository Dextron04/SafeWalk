import React from 'react';
import { motion } from 'framer-motion';
import chart from '../assets/output.png'; // Your pie chart image

export default function Statistics() {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <motion.h1
          className="text-4xl text-yellow-400 font-extrabold text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          📊 Why SafeWalk Matters
        </motion.h1>

        {/* U.S. Crisis */}
        <motion.div
          className="bg-gray-800 p-6 rounded-xl shadow-md space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl text-yellow-300 font-semibold mb-2">🚶‍♂️ The U.S. Pedestrian Safety Crisis</h2>
          <p>
            The United States faces an unprecedented rise in pedestrian fatalities. In just the first half of 2024, over <span className="text-yellow-400 font-bold">3,300 people</span> were struck and killed — a <span className="text-red-400 font-bold">48% increase</span> since 2014.
          </p>
          <p>
            Factors contributing to this rise include poor urban lighting, distracted driving, increased SUV usage, and insufficient pedestrian infrastructure. Areas like crosswalks, bus stops, and low-income neighborhoods are especially at risk.
          </p>
        </motion.div>

        {/* Global Outlook */}
        <motion.div
          className="bg-gray-800 p-6 rounded-xl shadow-md space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl text-blue-300 font-semibold mb-2">🌍 How the World is Doing Better</h2>
          <p>
            Globally, countries like <span className="text-green-300 font-bold">Sweden, Norway, and the Netherlands</span> have prioritized pedestrian infrastructure, resulting in <span className="text-green-400 font-bold">near-zero fatalities</span> annually.
          </p>
          <p>
            They use smart lighting, raised crosswalks, dedicated pedestrian lanes, and community reporting systems to improve urban walkability and safety.
          </p>
        </motion.div>

        {/* Chart */}
        <div className="text-center">
          <img
            src={chart}
            alt="US vs Global Pedestrian Deaths"
            className="rounded-xl shadow-lg border border-gray-600 max-w-full mx-auto"
          />
          <p className="text-sm text-gray-400 mt-2">Pedestrian deaths comparison (U.S. vs Global Average)</p>
        </div>

        {/* SafeWalk Impact */}
        <motion.div
          className="bg-gray-800 p-6 rounded-xl shadow-md space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl text-green-300 font-semibold mb-2">📈 How SafeWalk Helps</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li><span className="text-yellow-400 font-semibold">20,000+</span> crowd-sourced safety alerts in 2024</li>
            <li><span className="text-yellow-400 font-semibold">500+</span> verified safe zones marked with real-time data</li>
            <li><span className="text-yellow-400 font-semibold">12+</span> cities actively using SafeWalk for night walk tracking</li>
            <li><span className="text-yellow-400 font-semibold">30%</span> community risk reduction in beta test areas</li>
          </ul>
          <p className="text-gray-400 pt-2">
            SafeWalk bridges the gap between data and decision-making, giving users the power to choose safer paths backed by real-time insights.
          </p>
        </motion.div>

        {/* Call-to-Action */}
        <motion.div
          className="bg-gray-800 p-6 rounded-xl shadow-md space-y-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl text-purple-300 font-semibold mb-2">🔍 What’s Next?</h2>
          <p>
            Our mission doesn’t stop here. We're actively working on integrating AI to predict high-risk zones before incidents occur, as well as partnering with city governments to improve urban safety.
          </p>
          <p className="text-green-400 font-bold">Together, we can walk without fear.</p>
        </motion.div>

        {/* Footer */}
        <footer className="text-center text-gray-500 pt-8 border-t border-gray-700 text-sm">
          Sources: GHSA (2024), WHO Urban Safety Report, Vision Zero | Built for awareness by SafeWalk 💛
        </footer>
      </div>
    </div>
  );
}
