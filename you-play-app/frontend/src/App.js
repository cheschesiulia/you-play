import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LikedSongsPage from './pages/LikedSongsPage';
import ListeningHistoryPage from './pages/ListeningHistoryPage';
import PrivateRoute from './pages/PrivateRoute';
import SongPlayerPage from './pages/SongPlayerPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes using PrivateRoute */}
        <Route path="/" element={<PrivateRoute element={HomePage} />} />
        <Route path="/liked-songs" element={<PrivateRoute element={LikedSongsPage} />} />
        <Route path="/history" element={<PrivateRoute element={ListeningHistoryPage} />} />
        <Route path="/song/:title" element={<PrivateRoute element={SongPlayerPage} />} />
        <Route path="/recommendations" element={<PrivateRoute element={LikedSongsPage} />} />

        {/* Catch-all Route for 404 */}
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;