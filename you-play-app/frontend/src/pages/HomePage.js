import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../App.css';

function HomePage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);

  // Fetch songs from the backend
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
          // Now fetch cover URLs for each song
          const songsWithCovers = await Promise.all(
            data.map(async (song) => {
              const coverResponse = await fetch(`/streaming/cover/${song.title}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (coverResponse.ok) {
                const coverData = await coverResponse.json();
                song.cover_url = coverData.cover_url; // Assign the cover URL to the song
              } else {
                console.error(`Error fetching cover for ${song.title}`);
                song.cover_url = ''; // Fallback in case of error
              }

              return song;
            })
          );

          setSongs(songsWithCovers);
          setFilteredSongs(songsWithCovers);
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

  // Handle song search/filter
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
          <button className="nav-button" onClick={() => navigate('/liked-songs')}>Liked Songs</button>
          <button className="nav-button" onClick={() => navigate('/history')}>Listening History</button>
        </nav>
        <div className="logout-wrapper">
          <LogoutButton />
        </div>
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
                <div className="song-cover">
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}  // Display the cover image fetched from /cover/{title}
                      alt={song.title}
                      className="cover-img"
                    />
                  ) : (
                    <div className="no-cover">No Cover Available</div>  // Fallback if no cover
                  )}
                </div>
                <div className="song-details">
                  <h3>{song.title}</h3>
                  <p className="song-artist">{song.artist || 'Unknown Artist'}</p>
                  <p className="song-genre">{song.genre || 'Unknown Genre'}</p>
                  <p className="song-duration">{Math.floor(song.duration / 60)}:{('0' + song.duration % 60).slice(-2)}</p>
                </div>
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
