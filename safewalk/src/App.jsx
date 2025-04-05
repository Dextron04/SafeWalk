import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home';
import MapView from './components/mapview';
import Statics from './pages/statics';
import HelpCenter from './pages/HelpCenter';
import AlertFeed from './pages/AlertFeed';
import SafeRouteFinder from './pages/MySafeRoutes';
import Feedback from './components/Feedback';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/statistics" element={<Statics />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/alerts" element={<AlertFeed />} />
        <Route path="/routes" element={<SafeRouteFinder />} />
        <Route path="/feedback" element={<Feedback />} />
      </Routes>
    </>
  );
}
