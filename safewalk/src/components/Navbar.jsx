import { useState } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md z-50 relative">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-yellow-400">SafeWalk</Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden focus:outline-none"
        >
          ☰
        </button>
        <div className={`md:flex md:items-center md:space-x-6 ${isOpen ? 'block' : 'hidden'}`}>
          <Link to="/map" className="block mt-2 md:mt-0 hover:text-yellow-300">Map</Link>
          <Link to="/statistics" className="block mt-2 md:mt-0 hover:text-yellow-300">Statistics</Link>
          <Link to="/help" className="hover:text-yellow-300">Help</Link>
          <Link to="/alerts" className="hover:text-yellow-300">Alerts</Link>
          <Link to="/routes" className="hover:text-yellow-300">My Routes</Link>
          <Link to="/feedback" className="hover:text-yellow-300">Feedback</Link>

        </div>
      </div>
    </nav>
  );
}
