import React from 'react';
import BCANLogo from '../../public/assets/bcanlogo.png';
import './styles/Header.css'
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {

    const navigate = useNavigate();

  /** Enter the grant-info main app */
  const handleExitApp = () => {
    navigate('/dashboard');
  }

    return (
        <header className="header">
            <header className="header-left-comp">
                <li className="logo"><img src={BCANLogo}/></li>
            </header>
            <header className="header-right-comp">
                <ul className="grant-buttons">
                    <li className="all-grants">All Grants</li>
                    <li className="my-grants">My Grants</li>
                    <li className="active-grants">Active Grants</li>
                    <li className="inactive-grants">Inactive Grants</li>
                    <li onClick={handleExitApp} className="profile-picture">pfp</li>
                </ul>
            </header>
        </header>
    )
}

export default Header;