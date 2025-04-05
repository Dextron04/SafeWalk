import React, { useState } from 'react';

export default function MySR() {
  const [routes, setRoutes] = useState([
    { name: 'Home to College', time: '18 mins', zones: 5 },
    { name: 'Evening Gym Walk', time: '12 mins', zones: 3 },
  ]);

  const [form, setForm] = useState({ name: '', time: '', zones: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.time || !form.zones) return;

    setRoutes([{ ...form }, ...routes]);
    setForm({ name: '', time: '', zones: '' });
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-yellow-400">🗺️ My Safe Routes</h1>
        <p className="text-gray-400">Track and add your own verified walking routes below.</p>

        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-xl border border-gray-700">
          <input
            type="text"
            placeholder="Route Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 rounded bg-gray-900 border border-gray-600 text-white"
            required
          />
          <input
            type="text"
            placeholder="Average Walk Time (e.g. 15 mins)"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="w-full p-3 rounded bg-gray-900 border border-gray-600 text-white"
            required
          />
          <input
            type="number"
            placeholder="Number of Safe Zones Passed"
            value={form.zones}
            onChange={(e) => setForm({ ...form, zones: e.target.value })}
            className="w-full p-3 rounded bg-gray-900 border border-gray-600 text-white"
            required
          />
          <button
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-full"
          >
            ➕ Add Route
          </button>
        </form>

        <div className="space-y-4">
          {routes.map((route, index) => (
            <div
              key={index}
              className="bg-gray-800 p-4 rounded-xl shadow border border-gray-700"
            >
              <h2 className="text-xl font-semibold text-blue-300">{route.name}</h2>
              <p className="text-gray-300">✅ Safe zones passed: {route.zones}</p>
              <p className="text-gray-300">🕒 Avg walk time: {route.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
