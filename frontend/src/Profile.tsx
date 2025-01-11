// src/Profile.tsx

import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthContext } from './context/auth/authContext';
import { updateUserProfile } from './external/bcanSatchel/actions';

const Profile = observer(() => {
  const { user, isAuthenticated } = useAuthContext();
  const [email, setEmail] = useState(user?.email || '');
  const [biography, setBiography] = useState(user?.biography || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken ?? ''}`,
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
    <form onSubmit={handleSubmit} style={{maxWidth: '600px', 
                                          margin: '0 auto',
                                          border: '1px solid #ccc', 
                                          borderRadius: '8px', 
                                          padding: '20px 30px'  }}>
      <h2>Profile</h2>
      <div style = {{padding: '5px'}} >
        
        <label >Username: </label>
        <span>{user?.userId}</span>
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