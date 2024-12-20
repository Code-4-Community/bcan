import React from 'react';
import './styles/Header.css'

const Header: React.FC = () => {
    return (
        <header className="header">
            <header className="header-left-comp">
                <li className="logo">LOGO</li>
            </header>
            <header className="header-right-comp">
                <ul className="grant-buttons">
                    <li className="all-grants">All Grants</li>
                    <li className="my-grants">My Grants</li>
                    <li className="active-grants">Active Grants</li>
                    <li className="inactive-grants">Inactive Grants</li>
                    <li className="profile-picture">pfp</li>
                </ul>
            </header>
        </header>
    )
}

export default Header;