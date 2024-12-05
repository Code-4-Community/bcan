
import React, { useState } from 'react';
import { setAuthentication } from './external/bcanSatchel/actions';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import './styles/Register.css';

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
        <form onSubmit={handleSubmit} className="register-form">
            <h2 className="register-heading">Register</h2>
            <div>
                <label className="register-label">Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="register-input"
                />
            </div>
            <div>
                <label className="register-label">Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="register-input"
                />
            </div>
            <div>
                <label className="register-label">Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="register-input"
                />
            </div>
            <button type="submit" className="register-button">Register</button>
        </form>
    );
});

export default Register;
