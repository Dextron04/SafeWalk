import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Import your page components
import AlertFeed from './pages/AlertFeed';
import MySafeRoutes from './pages/MySafeRoutes';
import HelpCenter from './pages/HelpCenter.jsx';
import Statics from './pages/statics.jsx';
import Home from './pages/home.jsx';
// Import other pages as needed

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </React.StrictMode>
);
