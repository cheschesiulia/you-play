import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../App.css';

function LikedSongsPage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(`/playlist/liked-songs/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to fetch liked songs');
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const songsWithCovers = await Promise.all(
            data.map(async (song) => {
              const coverResponse = await fetch(`/streaming/cover/${encodeURIComponent(song.title)}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (coverResponse.ok) {
                const coverData = await coverResponse.json();
                song.cover_url = coverData.cover_url;
              } else {
                song.cover_url = '';
              }

              return song;
            })
          );

          setSongs(songsWithCovers);
          setLikedSongs(songsWithCovers.map(song => song.title));
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      }
    };

    fetchLikedSongs();
  }, [token, username]);

  const toggleLike = async (songTitle) => {
    const isLiked = likedSongs.includes(songTitle);
    const url = isLiked
      ? `/playlist/unlike-song/${username}/${encodeURIComponent(songTitle)}`
      : `/playlist/like-song/${username}/${encodeURIComponent(songTitle)}`;
    const method = isLiked ? 'DELETE' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setLikedSongs((prev) =>
          isLiked ? prev.filter((title) => title !== songTitle) : [...prev, songTitle]
        );
        if (isLiked) {
          setSongs((prev) => prev.filter((song) => song.title !== songTitle));
        }
      } else {
        console.error('Failed to toggle like status');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (error) {
    return (
      <div className="home-layout">
        <aside className="sidebar">
          <h2 className="logo">You-Play</h2>
          <nav>
            <button className="nav-button" onClick={() => navigate('/')}>Home</button>
            <button className="nav-button" onClick={() => navigate('/history')}>Listening History</button>
          </nav>
          <div className="logout-wrapper">
            <LogoutButton />
          </div>
        </aside>
        <main className="main-content">
          <h2>Error</h2>
          <p>{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="home-layout">
      <aside className="sidebar">
        <h2 className="logo">You-Play</h2>
        <nav>
          <button className="nav-button" onClick={() => navigate('/')}>Home</button>
        </nav>
        <div className="logout-wrapper">
          <LogoutButton />
        </div>
      </aside>

      <main className="main-content">
        <div className="top-bar">
          <h1>Liked Songs ❤️</h1>
          <div className="logout-button-wrapper">
            <LogoutButton />
          </div>
        </div>

        <div className="song-list">
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <div key={index} className="song-item">
                <div className="song-cover">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="cover-img"
                    />
                  ) : (
                    <div className="no-cover">No Cover Available</div>
                  )}
                </div>
                <div className="song-details">
                  <h3
                    className="song-title-link"
                    onClick={() => navigate(`/song/${encodeURIComponent(song.title)}`)}
                  >
                    {song.title}
                  </h3>
                </div>
                <button
                  className="like-button"
                  onClick={() => toggleLike(song.title)}
                >
                  ❤️ Unlike
                </button>
              </div>
            ))
          ) : (
            <p>No liked songs yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default LikedSongsPage;
