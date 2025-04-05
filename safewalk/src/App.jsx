import { Routes, Route } from 'react-router-dom';
import React from 'react';
import Home from './pages/home';
import MapView from './components/mapview';
import Statics from './pages/statics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/statistics" element={<Statics />} />
    </Routes>
  );
}

export default App;
