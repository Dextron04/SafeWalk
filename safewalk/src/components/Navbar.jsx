import { useState } from "react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path ? "text-yellow-400" : "hover:text-yellow-300";
  };

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
          <Link to="/map" className={isActive("/map")}>
            Map
          </Link>
          <Link to="/statistics" className={isActive("/statistics")}>
            Statistics
          </Link>
          <Link to="/help" className={isActive("/help")}>
            Help
          </Link>
          <Link to="/alerts" className={isActive("/alerts")}>
            Alerts
          </Link>
          <Link to="/routes" className={isActive("/routes")}>
            Smart Routes
          </Link>
          <Link to="/feedback" className={isActive("/feedback")}>
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
              className="hover:text-yellow-300 py-2 border-b border-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Map
            </Link>

            <Link
              to="/statistics"
              className="hover:text-yellow-300 py-2 border-b border-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Statistics
            </Link>

            <Link
              to="/help"
              className="hover:text-yellow-300 py-2 border-b border-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Help
            </Link>

            <Link
              to="/alerts"
              className="hover:text-yellow-300 py-2 border-b border-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Alerts
            </Link>

            <Link
              to="/routes"
              className="hover:text-yellow-300 py-2 border-b border-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Smart Routes
            </Link>
            <Link 
              to="/feedback" 
              className="hover:text-yellow-300 py-2"
              onClick={() => setIsOpen(false)}
            >
              Feedback
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
