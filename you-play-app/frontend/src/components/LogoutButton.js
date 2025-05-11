import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token from localStorage (or sessionStorage)
    localStorage.removeItem('token');
    
    // Optionally, you can clear sessionStorage if you used it
    // sessionStorage.removeItem('token');

    // Redirect to the login page
    navigate('/login');
  };

  return (
    <button
      className="button"
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;