import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';
import '../App.css';

function HomePage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchSongs = async () => {
      try {
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
          const songsWithCovers = await Promise.all(
            data.map(async (song) => {
              const coverResponse = await fetch(`/streaming/cover/${encodeURIComponent(song.title)}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
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
          setFilteredSongs(songsWithCovers);

          // Extract unique genres and artists
          setGenres([...new Set(songsWithCovers.map(song => song.genre).filter(Boolean))]);
          setArtists([...new Set(songsWithCovers.map(song => song.artist).filter(Boolean))]);

          await fetchLikedSongs(); // fetch liked songs after setting songs
        } else {
          setSongs([]);
          setFilteredSongs([]);
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    const fetchLikedSongs = async () => {
      try {
        const response = await fetch(`playlist/liked-songs/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const likedData = await response.json();
          setLikedSongs(likedData.map(song => song.title));
        }
      } catch (error) {
        console.error('Error fetching liked songs:', error);
      }
    };

    fetchSongs();
  }, [token, username]);

  useEffect(() => {
    let filtered = songs;

    if (selectedGenre) {
      filtered = filtered.filter(song => song.genre === selectedGenre);
    }
    if (selectedArtist) {
      filtered = filtered.filter(song => song.artist === selectedArtist);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter((song) =>
        song.title.toLowerCase().includes(lowerSearch)
      );
    }
    setFilteredSongs(filtered);
  }, [search, songs, selectedGenre, selectedArtist]);

  const handleGenreChange = async (e) => {
    const genre = e.target.value;
    setSelectedGenre(genre);
    setSelectedArtist(''); // reset artist filter

    if (genre) {
      try {
        const response = await fetch(`/streaming/songs/genre/${encodeURIComponent(genre)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
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
          setFilteredSongs(songsWithCovers);
        }
      } catch (error) {
        console.error('Error fetching songs by genre:', error);
      }
    } else {
      setFilteredSongs(songs);
    }
  };

  const handleArtistChange = async (e) => {
    const artist = e.target.value;
    setSelectedArtist(artist);
    setSelectedGenre(''); // reset genre filter

    if (artist) {
      try {
        const response = await fetch(`/streaming/songs/artist/${encodeURIComponent(artist)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
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
          setFilteredSongs(songsWithCovers);
        }
      } catch (error) {
        console.error('Error fetching songs by artist:', error);
      }
    } else {
      setFilteredSongs(songs);
    }
  };

  const toggleLike = async (event, songTitle) => {
    event.stopPropagation(); // prevent navigating to song page
    const isLiked = likedSongs.includes(songTitle);
    const url = isLiked
      ? `playlist/unlike-song/${username}/${encodeURIComponent(songTitle)}`
      : `playlist/like-song/${username}/${encodeURIComponent(songTitle)}`;

    const method = isLiked ? 'DELETE' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select value={selectedGenre} onChange={handleGenreChange}>
            <option value="">Filter by Genre</option>
            {genres.map((genre, idx) => (
              <option key={idx} value={genre}>{genre}</option>
            ))}
          </select>
          <select value={selectedArtist} onChange={handleArtistChange}>
            <option value="">Filter by Artist</option>
            {artists.map((artist, idx) => (
              <option key={idx} value={artist}>{artist}</option>
            ))}
          </select>
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
                  <p className="song-artist">{song.artist || 'Unknown Artist'}</p>
                  <p className="song-genre">{song.genre || 'Unknown Genre'}</p>
                  <p className="song-duration">
                    {Math.floor(song.duration / 60)}:{('0' + (song.duration % 60)).slice(-2)}
                  </p>
                </div>
                <button
                  className="like-button"
                  onClick={(e) => toggleLike(e, song.title)}
                >
                  {likedSongs.includes(song.title) ? '❤️ Unlike' : '🤍 Like'}
                </button>
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
