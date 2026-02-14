import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="App font-sans antialiased text-gray-900">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
