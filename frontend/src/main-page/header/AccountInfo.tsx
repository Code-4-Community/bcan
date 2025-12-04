import React, { useState } from 'react';
import './styles/AccountInfo.css';
import { logoutUser,
} from "../../external/bcanSatchel/actions.ts";
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from "../../context/auth/authContext";
import { createPortal } from 'react-dom';

interface AccountInfoProps {
  email: string;
  username: string;
  role: string;
  setOpenModal: (modal: string | null) => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  email,
  username,
  role,
  setOpenModal,
}) => {

  const navigate = useNavigate();
  const {user} = useAuthContext();

  const [isAdmin] = useState(user?.position === 'Admin');

  const handleUserListClick = () => {
    navigate('users');
    setOpenModal(null);
  };

  const handleLogoutClick = () => {
    logoutUser();
    setOpenModal(null);
  };

  return createPortal(
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
          {isAdmin &&
          <div className="button-container">
          <button className="user-list-btn" onClick={handleUserListClick}> 
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 12C7 12 6 12 6 11C6 10 7 7 11 7C15 7 16 10 16 11C16 12 15 12 15 12H7ZM11 6C11.7956 6 12.5587 5.68393 13.1213 5.12132C13.6839 4.55871 14 3.79565 14 3C14 2.20435 13.6839 1.44129 13.1213 0.87868C12.5587 0.316071 11.7956 0 11 0C10.2044 0 9.44129 0.316071 8.87868 0.87868C8.31607 1.44129 8 2.20435 8 3C8 3.79565 8.31607 4.55871 8.87868 5.12132C9.44129 5.68393 10.2044 6 11 6ZM5.216 12C5.06782 11.6878 4.9939 11.3455 5 11C5 9.645 5.68 8.25 6.936 7.28C6.30918 7.08644 5.65598 6.99197 5 7C1 7 0 10 0 11C0 12 1 12 1 12H5.216ZM4.5 6C5.16304 6 5.79893 5.73661 6.26777 5.26777C6.73661 4.79893 7 4.16304 7 3.5C7 2.83696 6.73661 2.20107 6.26777 1.73223C5.79893 1.26339 5.16304 1 4.5 1C3.83696 1 3.20107 1.26339 2.73223 1.73223C2.26339 2.20107 2 2.83696 2 3.5C2 4.16304 2.26339 4.79893 2.73223 5.26777C3.20107 5.73661 3.83696 6 4.5 6Z" fill="black"/>
          </svg>
            User List </button>
            <button className="logout-btn" onClick={handleLogoutClick}>
              Logout
            </button>
          </div>
          }
        </div>
      </div>, 
      document.body
  );
};


export default AccountInfo;
