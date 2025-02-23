import React from "react";
import { Link } from "react-router-dom";
import "./styles/Header.css";
import { useState } from "react";
import logo from "../../images/bcan_logo.svg"

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
    <header className="header mx-auto  max-w-8xl mb-5">
      <header className="header-left-comp mx-5">
        <img className="logo" src={logo} alt="BCAN Logo" />
      </header>
      <header className="header-right-comp w-full">
        <ul className="grant-buttons flex flex-row w-full justify-around">
          {linkList.map((item, index) => (
            <li key={index} className="flex-grow w-auto">
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
