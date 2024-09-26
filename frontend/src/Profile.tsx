// src/Profile.tsx

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { getStore } from './store';
import { updateUserProfile } from './actions';

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
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Profile</h2>
      <div>
        <label>Username:</label>
        <span>{store.user?.userId}</span>
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Biography:</label>
        <textarea
          style={{ width: '100%', padding: '8px', margin: '8px 0' }}
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
        ></textarea>
      </div>
      <button type="submit" style={{ padding: '10px', fontSize: '16px' }}>
        Save Changes
      </button>
    </form>
  );
});

export default Profile;