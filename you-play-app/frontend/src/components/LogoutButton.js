import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="logout-container">
      <button className="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;
