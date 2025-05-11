// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcome to You-Play</h1>
      <button className="button" onClick={() => navigate('/liked-songs')}>Liked Songs</button>
      <button className="button" onClick={() => navigate('/history')}>Listening History</button>
      <LogoutButton />  {/* Display the Logout Button */}
    </div>
  );
}

export default HomePage;
