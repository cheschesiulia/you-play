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
<<<<<<< HEAD
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
=======
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
>>>>>>> 52adba192300506486be4ebc48b659b1f3742710

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

    const fetchGenresAndArtists = async () => {
      try {
        const response = await fetch('/streaming/genres-artists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const { genres, artists } = await response.json();
          setGenres(genres);
          setArtists(artists);
        }
      } catch (error) {
        console.error('Error fetching genres and artists:', error);
      }
    };

    fetchSongs();
    fetchGenresAndArtists();
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

  useEffect(() => {
    let updatedSongs = [...songs];

    if (selectedGenre) {
      updatedSongs = updatedSongs.filter(song => song.genre === selectedGenre);
    }

    if (selectedArtist) {
      updatedSongs = updatedSongs.filter(song => song.artist === selectedArtist);
    }

    setFilteredSongs(updatedSongs);
  }, [selectedGenre, selectedArtist, songs]);

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

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleArtistChange = (e) => {
    setSelectedArtist(e.target.value);
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
          <h1>Welcome back <span role="img" aria-label="wave">👋</span></h1>
          <div className="logout-button-wrapper">
            <LogoutButton />
          </div>
        </div>

<<<<<<< HEAD
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <select
            value={selectedGenre}
            onChange={handleGenreChange}
            className="filter-select"
            style={{
              background: '#232323',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0002'
            }}
          >
            <option value="">🎵 Filter by Genre</option>
=======
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select value={selectedGenre} onChange={handleGenreChange}>
            <option value="">Filter by Genre</option>
>>>>>>> 52adba192300506486be4ebc48b659b1f3742710
            {genres.map((genre, idx) => (
              <option key={idx} value={genre}>{genre}</option>
            ))}
          </select>
<<<<<<< HEAD
          <select
            value={selectedArtist}
            onChange={handleArtistChange}
            className="filter-select"
            style={{
              background: '#232323',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '1rem',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0002'
            }}
          >
            <option value="">🎤 Filter by Artist</option>
=======
          <select value={selectedArtist} onChange={handleArtistChange}>
            <option value="">Filter by Artist</option>
>>>>>>> 52adba192300506486be4ebc48b659b1f3742710
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
          style={{
            background: '#232323',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '12px 20px',
            fontSize: '1rem',
            marginBottom: '2rem',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />

        <div className="song-list">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song, index) => (
              <div
                key={index}
                className="song-item"
                style={{
                  background: '#181818',
                  borderRadius: '16px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.2rem 2rem',
                  boxShadow: '0 2px 12px #0003'
                }}
              >
                <div className="song-cover" style={{ marginRight: '1.5rem' }}>
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="cover-img"
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        boxShadow: '0 2px 8px #0006'
                      }}
                    />
                  ) : (
                    <div
                      className="no-cover"
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '12px',
                        background: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#aaa',
                        fontSize: '0.9rem'
                      }}
                    >
                      No Cover
                    </div>
                  )}
                </div>
                <div className="song-details" style={{ flex: 1 }}>
                  <h3
                    className="song-title-link"
                    onClick={() => navigate(`/song/${encodeURIComponent(song.title)}`)}
                    style={{
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '1.3rem',
                      marginBottom: '0.3rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {song.title}
                  </h3>
                  <div style={{ color: '#ffb6b6', fontWeight: 500, marginBottom: '0.2rem' }}>
                    {song.artist || 'Unknown Artist'}
                  </div>
                  <div style={{ color: '#b6b6ff', marginBottom: '0.2rem' }}>
                    {song.genre || 'Unknown Genre'}
                  </div>
                  <div style={{ color: '#aaa' }}>
                    {Math.floor(song.duration / 60)}:{('0' + (song.duration % 60)).slice(-2)}
                  </div>
                </div>
                <button
                  className="like-button"
                  onClick={(e) => toggleLike(e, song.title)}
                  style={{
                    background: likedSongs.includes(song.title) ? 'linear-gradient(90deg, #ff6a6a, #ffb6b6)' : '#232323',
                    color: likedSongs.includes(song.title) ? '#fff' : '#ffb6b6',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '10px 22px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginLeft: '1.5rem',
                    transition: 'background 0.2s, color 0.2s'
                  }}
                >
                  {likedSongs.includes(song.title) ? '❤️ Unlike' : '🤍 Like'}
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: '#fff', textAlign: 'center', marginTop: '2rem' }}>No songs found.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
