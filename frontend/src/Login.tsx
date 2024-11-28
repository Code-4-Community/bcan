
import React, { useState } from 'react';
import { setAuthentication } from './external/bcanSatchel/actions'; // Corrected import path
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';

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
                alert(data.message); // Alert with message from backend indicating success
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred while logging in. Please try again later.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2 className="login-heading">Login</h2>
            <div>
                <label className="login-label">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="login-input"
                />
            </div>
            <div>
                <label className="login-label">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="login-input"
                />
            </div>
            <button type="submit" className="login-button">Login</button>
            <button type="button" className="login-button-forgot">Forgot Password?</button>
        </form>
    );
});

export default Login;
