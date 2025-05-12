// src/pages/ListeningHistoryPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../App.css';

function ListeningHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/playlist/listening-history/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listening history');
        }

        const data = await response.json();

        const songsWithCovers = await Promise.all(
          data.map(async (entry) => {
            const song = {
              title: entry.song_title,
              listened_at: entry.listened_at,
            };

            const coverRes = await fetch(`/streaming/cover/${encodeURIComponent(song.title)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (coverRes.ok) {
              const coverData = await coverRes.json();
              song.cover_url = coverData.cover_url;
            } else {
              song.cover_url = '';
            }

            return song;
          })
        );

        setHistory(songsWithCovers);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      }
    };

    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(`/playlist/liked-songs/${username}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const likedData = await response.json();
          setLikedSongs(likedData.map(song => song.title));
        }
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };

    fetchHistory();
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
          <h1>Listening History 🎧</h1>
          <div className="logout-button-wrapper">
            <LogoutButton />
          </div>
        </div>

        <div className="song-list">
          {history.length > 0 ? (
            history.map((song, index) => (
              <div key={index} className="song-item">
                <div className="song-cover">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="cover-img"
                    />
                  ) : (
                    <div className="no-cover">No Cover</div>
                  )}
                </div>
                <div className="song-details">
                  <h3>{song.title}</h3>
                  <p className="song-date">Listened at: {new Date(song.listened_at).toLocaleString()}</p>
                </div>
                <button
                  className="like-button"
                  onClick={() => toggleLike(song.title)}
                >
                  {likedSongs.includes(song.title) ? '❤️ Unlike' : '🤍 Like'}
                </button>
              </div>
            ))
          ) : (
            <p>No listening history found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default ListeningHistoryPage;
