import React, { useState } from 'react';
import './styles/AccountInfo.css';
import { logoutUser,
} from "../../external/bcanSatchel/actions.ts";
interface AccountInfoProps {
  email: string;
  username: string;
  role: string;
  setShowAccountInfo: (show: boolean) => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  email,
  username,
  role,
  setShowAccountInfo,
}) => {
  const handleOverlayClick = () => {
    setShowAccountInfo(false); // closes the modal
  };

  const handleUserListClick = () => {
    console.log("Navigate to user list");
    setShowAccountInfo(false); // close modal if navigating
  };

  const handleLogoutClick = () => {
    logoutUser();
    setShowAccountInfo(false); // close modal after logout
  };

  return (
    <>
      <div className="account-overlay" onClick={handleOverlayClick} />
      <div className="account-modal" onClick={(e) => e.stopPropagation()}>
        <div className="account-popup">
          <h1 className="popup-header">Account Info</h1>

          <div className="account-info">
            <div className="info-row">
              <span className="info-label">E-mail:</span>
              <span className="info-value">{email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Username:</span>
              <span className="info-value">{username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role:</span>
              <span className="info-value">{role}</span>
            </div>
          </div>

          <div className="button-container">
          <button className="user-list-btn" onClick={handleUserListClick}> 
          <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /> <circle cx="9" cy="7" r="4" /> <path d="M23 21v-2a4 4 0 0 0-3-3.87" /> <path d="M16 3.13a4 4 0 0 1 0 7.75" /> </svg> User List </button>
            <button className="logout-btn" onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


export default AccountInfo;
