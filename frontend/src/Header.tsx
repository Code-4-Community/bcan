import React, {useState} from "react";
import {Link} from "react-router-dom";
import "./styles/Header.css";
import logo from "./images/bcan_logo.svg";
import {Status, statusToString} from "../../middle-layer/types/Status"
import { updateFilter} from './external/bcanSatchel/actions.ts'
import {getAppStore} from "./external/bcanSatchel/store.ts";
interface NavBarProps {
  name: string;
  linkTo?: string;
  filter?: Status;
}

const linkList: NavBarProps[] = [
  { name: "My Grants"},
  { name: "Active Grants", filter: Status.Active},
  { name: "Inactive Grants", filter: Status.Inactive },
  { name: "Potential Grants", filter: Status.Potential },
  { name: "My Account", linkTo: "/account" },
];


/**
 * Header
 * @returns HTML for the header component
 */
const Header: React.FC = () => {
  const [selected, setSelected] = useState("All Grants");

  function categoryClicked(e: React.MouseEvent, category: string, linkTo?: string) {
    if (!linkTo) {
        e.preventDefault(); // will stop reload if there is no link to go to
    }
    setSelected(category);
    // Update the store
    updateFilter(statusToString(category));
    // Check that the store is updated
    const store = getAppStore();
    console.log("Current filter:", store.filterStatus);
  }

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
                onClick={(e) => categoryClicked(e,item.name, item.linkTo)}
                style={{
                  color: selected === item.name ? "#3191CF" : "#000000",
                  textDecoration: selected === item.name ? "underline" : "none",
                }}
                to={item.linkTo || "#"} // # means will not reload
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
