// src/Register.tsx

import React, { useState } from 'react';
import { setAuthentication } from './external/bcanSatchel/actions';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

const Register = observer(() => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await response.json();

    if (response.ok) {
      // Automatically log in the user
      const loginResponse = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.access_token) {
        setAuthentication(true, loginData.user, loginData.access_token);
        navigate('/dashboard');
      } else {
        alert(loginData.message || 'Login after registration failed.');
      }
    } else {
      alert(data.message || 'Registration failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Register</h2>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', margin: '8px 0' }}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', margin: '8px 0' }}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', margin: '8px 0' }}
        />
      </div>
      <button type="submit" style={{ padding: '10px', width: '100%' }}>
        Register
      </button>
    </form>
  );
});

export default Register;