// src/pages/LikedSongsPage.js
import React, { useEffect, useState } from 'react';

function LikedSongsPage() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('playlist/liked-songs/your_username', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setSongs);
  }, []);

  return (
    <div className="container">
      <h2>Liked Songs</h2>
      <div className="songs-grid">
        {songs.map(song => (
          <div key={song.title} className="song-card">
            <img
              src={`streaming/cover/${song.title}`}
              alt={song.title}
              style={{ width: 150, height: 150 }}
            />
            <p>{song.title} - {song.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LikedSongsPage;
