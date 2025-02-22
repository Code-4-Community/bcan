import React from "react";
import { Link } from "react-router-dom";
import "./styles/Header.css";
import { useState } from "react";
import logo from "./images/bcan_logo.svg";

interface NavBarProps {
  name: string;
  linkTo?: string;
}

const linkList: NavBarProps[] = [
  { name: "All Grants" },
  { name: "My Grants" },
  { name: "Active Grants" },
  { name: "Inactive Grants" },
  { name: "My Account", linkTo: "/account" },
];

/**
 * Header
 * @returns HTML for the header component
 */
const Header: React.FC = () => {
  const [selected, setSelected] = useState("All Grants");

  return (
    <header className="header">
      <header className="header-left-comp">
        <img className="logo" src={logo} alt="BCAN Logo" />
      </header>
      <header className="header-right-comp">
        <ul className="grant-buttons">
          {linkList.map((item, index) => (
            <li key={index}>
              <Link
                onClick={() => setSelected(item.name)}
                style={{
                  color: selected === item.name ? "#3191CF" : "#000000",
                  textDecoration: selected === item.name ? "underline" : "none",
                }}
                to={item.linkTo || ""}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </header>
    </header>
  );
};

export default Header;
