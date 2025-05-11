import React from 'react';
import { Navigate } from 'react-router-dom';

// This will act as a wrapper for protected routes
const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('token');  // Check if the user is authenticated

  if (!token) {
    // If no token is found, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If token exists, render the protected component
  return <Component {...rest} />;
};

export default PrivateRoute;
