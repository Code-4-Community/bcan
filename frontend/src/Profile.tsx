
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { getStore } from './external/bcanSatchel/store';
import { updateUserProfile } from './external/bcanSatchel/actions';
import './styles/Profile.css';

const Profile = observer(() => {
    const store = getStore();
    const [email, setEmail] = useState(store.user?.email || '');
    const [biography, setBiography] = useState(store.user?.biography || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/user/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${store.accessToken}`,
                },
                body: JSON.stringify({ email, biography }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to update profile.');
                return;
            }

            const data = await response.json();

            updateUserProfile(data);
            alert('Profile updated successfully.');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating your profile.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="profile-form">
            <h2 className="profile-heading">Profile</h2>
            <div className="profile-section">
                <label className="profile-label">Username:</label>
                <span>{store.user?.userId}</span>
            </div>
            <div className="profile-section">
                <label className="profile-label">Email:</label>
                <input
                    type="email"
                    className="profile-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="profile-section">
                <label className="profile-label">Biography:</label>
                <textarea
                    className="profile-input"
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                ></textarea>
            </div>
            <button type="submit" className="profile-button">Save Changes</button>
        </form>
    );
});

export default Profile;
