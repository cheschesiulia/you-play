import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const register = async () => {
    const response = await fetch('auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      alert('Registration successful! Please login.');
      navigate('/login');
    } else {
      const error = await response.json();
      alert(`Registration failed: ${error.detail}`);
    }
  };

  return (
    <div className="container">
      <h2>Create Your You-Play Account</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="button" onClick={register}>Register</button>
      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
}

export default RegisterPage;
