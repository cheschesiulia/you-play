// src/pages/HomePage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../App.css';

function HomePage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/streaming/songs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setSongs(data);
          setFilteredSongs(data);
        } else {
          console.error('Unexpected data format:', data);
          setSongs([]);
          setFilteredSongs([]);
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const filtered = songs.filter((song) =>
      song.title.toLowerCase().includes(lowerSearch)
    );
    setFilteredSongs(filtered);
  }, [search, songs]);

  return (
    <div className="home-layout">
      <aside className="sidebar">
        <h2 className="logo">You-Play</h2>
        <nav>
          <button className="nav-button" onClick={() => navigate('/')}>Home</button>
          <button className="nav-button" onClick={() => navigate('/liked-songs')}>Liked Songs</button>
          <button className="nav-button" onClick={() => navigate('/history')}>Listening History</button>
        </nav>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <h1>Welcome back 👋</h1>
          <div className="logout-button-wrapper">
            <LogoutButton />
          </div>
        </div>

        <input
          className="search-bar"
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="song-list">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song, index) => (
              <div key={index} className="song-item">
                🎵 {song.title} <span className="song-meta">({song.artist || 'Unknown'})</span>
              </div>
            ))
          ) : (
            <p>No songs found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
