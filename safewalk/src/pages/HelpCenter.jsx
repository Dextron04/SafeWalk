import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function HelpCenter() {
  const [panicClicked, setPanicClicked] = useState(false);

  const handlePanicClick = () => {
    setPanicClicked(true);
    setTimeout(() => {
      alert('🚨 Emergency services notified!\nYour location has been shared.');
    }, 1200);
  };

  const tips = [
    '📍 Always share your location with a trusted contact.',
    '🔦 Stick to well-lit, populated streets — avoid shortcuts.',
    '📱 Keep your phone charged and accessible.',
    '🧍‍♀️ Walk confidently and avoid distractions (like loud music).',
    '🚨 If something feels wrong, trust your instincts and seek help.',
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <motion.h1
          className="text-4xl font-bold text-yellow-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🆘 SafeWalk Help Center
        </motion.h1>

        <motion.p
          className="text-lg text-gray-300 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your safety is our priority. Read these essential tips and use the emergency features below.
        </motion.p>

        <div className="bg-gray-800 p-6 rounded-xl space-y-4">
          <h2 className="text-2xl text-green-300 font-semibold mb-2">✅ Safety Tips for Walking Alone</h2>
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              className="text-gray-200 text-base"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.2 }}
            >
              {tip}
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePanicClick}
            className={`text-lg font-bold px-6 py-3 rounded-full transition-all shadow-lg ${
              panicClicked
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            🚨 Tap to Call for Help
          </motion.button>

          {panicClicked && (
            <motion.p
              className="text-green-400 font-medium mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Emergency notification sent! Stay where you are.
            </motion.p>
          )}
        </div>

        <div className="text-center text-sm text-gray-400 mt-10">
          Need more help? Contact us at <a href="mailto:support@safewalk.io" className="underline text-blue-400">support@safewalk.io</a>
        </div>
      </div>
    </div>
  );
}
