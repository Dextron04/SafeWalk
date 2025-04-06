import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Statics() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '911 Calls by Type of Crime',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1,
      },
    ],
  });

  const fetchCrimeData = async () => {
    const API_URL = `http://localhost:5000/api/911calls`;

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      const crimeCounts = {};
      data.calls.forEach(call => {
        const type = call.callType || 'Unknown';
        crimeCounts[type] = (crimeCounts[type] || 0) + 1;
      });

      const sortedTypes = Object.entries(crimeCounts).sort((a, b) => b[1] - a[1]);
      const labels = sortedTypes.map(([type]) => type);
      const counts = sortedTypes.map(([, count]) => count);

      setChartData({
        labels,
        datasets: [
          {
            label: '911 Calls by Type of Crime',
            data: counts,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching crime data:', error);
    }
  };

  useEffect(() => {
    fetchCrimeData();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-5 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        {/* Title */}
        <motion.h1
          className="text-2xl sm:text-4xl text-yellow-400 font-extrabold text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          📊 911 Call Trends (Past 30 Days)
        </motion.h1>

        {/* Chart Section */}
        <motion.div
          className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md overflow-x-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl sm:text-2xl text-blue-300 font-semibold mb-4">
            🚨 911 Calls Made by Type of Crime
          </h2>
          <div className="w-[800px] sm:w-full">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: '911 Calls Grouped by Crime Type (Last 30 Days)',
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Calls',
                    },
                  },
                  y: {
                    ticks: {
                      font: {
                        size: 10,
                      },
                    },
                  },
                },
              }}
              height={400}
            />
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl sm:text-2xl text-green-300 font-semibold mb-2">📈 How SafeWalk Helps</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm sm:text-base">
            <li><span className="text-yellow-400 font-semibold">20,000+</span> crowd-sourced safety alerts in 2024</li>
            <li><span className="text-yellow-400 font-semibold">500+</span> verified safe zones marked with real-time data</li>
            <li><span className="text-yellow-400 font-semibold">12+</span> cities actively using SafeWalk for night walk tracking</li>
            <li><span className="text-yellow-400 font-semibold">30%</span> community risk reduction in beta test areas</li>
          </ul>
          <p className="text-gray-400 pt-2 text-sm sm:text-base">
            SafeWalk bridges the gap between data and decision-making, giving users the power to choose safer paths backed by real-time insights.
          </p>
        </motion.div>

        {/* Footer */}
        <footer className="text-center text-gray-500 pt-8 border-t border-gray-700 text-xs sm:text-sm">
          Source: San Francisco 911 Open Data | Built with 💛 by SafeWalk
        </footer>
      </div>
    </div>
  );
}
