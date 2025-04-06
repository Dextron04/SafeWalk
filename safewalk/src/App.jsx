import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home';
import MapView from './components/MapView';
import Statistics from './pages/Statistics';
import HelpCenter from './pages/HelpCenter';
import AlertFeed from './pages/AlertFeed';
import SFTransitRouteFinder from './pages/MySafeRoutes';
import Feedback from './components/Feedback';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/alerts" element={<AlertFeed />} />
        <Route path="/routes" element={<SFTransitRouteFinder />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </>
  );
}
