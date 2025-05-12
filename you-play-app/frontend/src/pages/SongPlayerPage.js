import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../App.css';

function SongPlayerPage() {
  const { title } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  let hasAddedToHistory = false;

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        // Fetch download URL
        const songResponse = await fetch(`/streaming/song/${encodeURIComponent(title)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!songResponse.ok) throw new Error('Failed to get song');
        const songData = await songResponse.json();
        setAudioUrl(songData.download_url);

        // Fetch song metadata
        const metaResponse = await fetch(`/streaming/songs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allSongs = await metaResponse.json();
        const matched = allSongs.find(s => s.title === title);
        if (matched) setSong(matched);

        // Fetch cover image
        const coverResponse = await fetch(`/streaming/cover/${encodeURIComponent(title)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (coverResponse.ok) {
          const coverData = await coverResponse.json();
          setCoverUrl(coverData.cover_url);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load song');
      }
    };

    fetchSongData();
  }, [title, token]);

  const addToListeningHistory = async () => {
    if (hasAddedToHistory) return;
    hasAddedToHistory = true;

    try {
      await fetch('/playlist/listening-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username,
          song_title: title,
        }),
      });
    } catch (err) {
      console.error('Failed to add to listening history', err);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!song || !audioUrl) {
    return <div>Loading...</div>;
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
        <div className="song-player-container">
          {coverUrl ? (
            <img src={coverUrl} alt={song.title} className="player-cover" />
          ) : (
            <div className="no-cover">No Cover Available</div>
          )}
          <h2>{song.title}</h2>
          <p className="song-artist">{song.artist || 'Unknown Artist'}</p>
          <p className="song-genre">{song.genre || 'Unknown Genre'}</p>

          <audio
            controls
            src={audioUrl}
            className="audio-player"
            onPlay={addToListeningHistory}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      </main>
    </div>
  );
}

export default SongPlayerPage;
