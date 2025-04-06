import { useState } from "react";
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md z-50 relative">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-yellow-400">
          SafeWalk
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden focus:outline-none p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          <Link to="/map" className="hover:text-yellow-300">
            Map
          </Link>
          <Link to="/statistics" className="hover:text-yellow-300">
            Statistics
          </Link>
          <Link to="/help" className="hover:text-yellow-300">
            Help
          </Link>
          <Link to="/alerts" className="hover:text-yellow-300">
            Alerts
          </Link>
          <Link to="/routes" className="hover:text-yellow-300">
            Smart Routes
          </Link>
          <Link to="/feedback" className="hover:text-yellow-300">
            Feedback
          </Link>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 shadow-lg py-4 px-6 z-50">
          <div className="flex flex-col space-y-4">
            <Link
              to="/map"
              className="hover:text-yellow-300 py-2 border-b border
            -gray-700"
            >
              Map
            </Link>

            <Link
              to="/s
t             atistics"
              className="hover:text-yellow-300 py-2 border-b border
            -gray-700"
            >
              Statistics
            </Link>

            <Link
              t
              o="/help"
              className="hover:text-yellow-300 py-2 border-b border
            -gray-700"
            >
              Help
            </Link>

            <Link
              to="/alerts"
              className="hover:text-yellow-300 py-2 border-b border
            -gray-700"
            >
              Alerts
            </Link>

            <Link
              to="/routes"
              className="hover:text-yellow-300 py-2 border-b border
            -gray-700"
            >
              Smart Routes
            </Link>
            <Link to="/feedback" className="hover:text-yellow-300 py-2">
              Feedback
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
