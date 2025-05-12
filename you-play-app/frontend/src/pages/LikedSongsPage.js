// src/pages/LikedSongsPage.js
import React, { useEffect, useState } from 'react';

function LikedSongsPage() {
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Decode JWT to get username
    const payload = token?.split('.')[1];
    let username = null;

    try {
      if (payload) {
        const decoded = JSON.parse(atob(payload));
        username = decoded.sub;
      }
    } catch (e) {
      console.error('Invalid token payload');
      setError('Invalid token');
      return;
    }

    if (!username) {
      setError('Username not found in token');
      return;
    }

    fetch(`/playlist/liked-songs/${username}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Failed to fetch liked songs');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setSongs(data);
        } else {
          throw new Error('Unexpected response format');
        }
      })
      .catch(err => {
        console.error(err.message);
        setError(err.message);
      });
  }, []);

  if (error) return <div className="container"><h2>Error</h2><p>{error}</p></div>;

  return (
    <div className="container">
      <h2>Liked Songs</h2>
      <div className="songs-grid">
        {songs.map(song => (
          <div key={song.title} className="song-card">
            <img
              src={`/streaming/cover/${song.title}`}
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
