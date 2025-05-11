// src/pages/ListeningHistoryPage.js
import React, { useEffect, useState } from 'react';

function ListeningHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('playlist/listening-history/your_username', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setHistory);
  }, []);

  return (
    <div className="container">
      <h2>Listening History</h2>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>{entry.song_title} — {new Date(entry.listened_at).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}

export default ListeningHistoryPage;
