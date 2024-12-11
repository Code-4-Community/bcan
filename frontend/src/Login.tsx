// src/Login.tsx

import React, { useState } from 'react';
import { setAuthentication } from './external/bcanSatchel/actions.js'; // Corrected import path
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';

const Login = observer(() => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'Login failed. Please check your credentials.');
        return;
      }

      const data = await response.json();
      console.log('Login response data:', data);

      if (data.access_token) {
        setAuthentication(true, data.user, data.access_token);
        navigate('/dashboard');
        alert(data.message); // Alert wit message from backend indicating success
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred while logging in. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', 
                                           margin: '0 auto', 
                                           justifyContent: 'center', 
                                           alignItems: 'center', 
                                           border: '1px solid #ccc', 
                                           borderRadius: '8px', 
                                           padding: '20px 30px'}}>
      <h2>Login</h2>
      <div>
        <label style={{ display: 'block', textAlign: 'left' }}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{width: '90%', 
                  padding: '8px', 
                  margin: '8px 0'}}
        />
      </div>
      <div>
        <label style={{ display: 'block', textAlign: 'left' }} >Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '90%', padding: '8px', margin: '8px 0'}}
        />
    
      </div>
      <button 
          type="submit" 
          style={{ padding: '8px', width :'100%', margin: '8px 0', backgroundColor: 'black', color: 'white'}}>
          Login
      </button>
      <button 
          type="submit" 
          style={{ padding: '8px', width :'100%', margin: '8px 0', backgroundColor: 'white', color: 'black'}}>
          Forgot Password?
      </button>
    </form>
  );
});

export default Login;