import React, { useState } from 'react';
import { useAuthContext } from './authContext';

const NewPasswordForm = () => {
    const [newPassword, changePasswordState] = useState('');
    const [email, setEmail] = useState('');
    const { setNewPassword, requiredAttributes } = useAuthContext();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (requiredAttributes?.includes('email')) {
        await setNewPassword(newPassword, email);
      } else {
        await setNewPassword(newPassword);
      }
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => changePasswordState(e.target.value)}
          required
        />
        {requiredAttributes?.includes('email') && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <button type="submit">Set New Password</button>
      </form>
    );
  };

export default NewPasswordForm;