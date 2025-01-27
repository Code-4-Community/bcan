import React from "react";
import { Link } from "react-router-dom";
import "./styles/Header.css";

/**
 * Header
 * @returns HTML for the header component
 */
const Header: React.FC = () => {
  return (
    <header className="header">
      <header className="header-left-comp">
        <li className="logo">
          <img src={"../../images/bcan_logo.png"} alt="BCAN Logo" />
        </li>
      </header>
      <header className="header-right-comp">
        <ul className="grant-buttons">
          <li className="all-grants">All Grants</li>
          <li className="my-grants">My Grants</li>
          <li className="active-grants">Active Grants</li>
          <li className="inactive-grants">Inactive Grants</li>
          <li className="profile-picture">
            <Link style={{ color: "black" }} to="/account">
              My Account
            </Link>
          </li>
        </ul>
      </header>
    </header>
  );
};

export default Header;
