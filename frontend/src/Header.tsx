import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./styles/Header.css";
import logo from "./images/bcan_logo.svg";
import { Status, statusToString } from "../../middle-layer/types/Status";
import { updateFilter, logoutUser } from "./external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import { Menu, Button } from "@chakra-ui/react";
import { FaCog } from "react-icons/fa";
import BellButton from "./Bell.tsx";

interface NavBarProps {
  name: string;
  linkTo?: string;
  filter?: Status;
}

const linkList: NavBarProps[] = [
  { name: "My Grants" },
  { name: "Active Grants", filter: Status.Active },
  { name: "Inactive Grants", filter: Status.Inactive },
  { name: "Potential Grants", filter: Status.Potential },
];

/**
 * Header component provides the main navigation along with a settings cog.
 * The cog displays a dropdown with "My Account" and "Logout" options.
 */
const Header: React.FC = observer(() => {
  const [selected, setSelected] = useState("All Grants");

  function categoryClicked(e: React.MouseEvent, category: string, linkTo?: string) {
    if (!linkTo) {
      e.preventDefault();
      updateFilter(statusToString(category));
      setSelected(category);
    }
  }

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <header className="header">
      <div className="header-left-comp">
        <img className="logo" src={logo} alt="BCAN Logo" />
      </div>
      <div className="header-right-comp">
        <ul className="grant-buttons">
          {linkList.map((item, index) => (
            <li key={index}>
              <Link
                onClick={(e) => categoryClicked(e, item.name, item.linkTo)}
                style={{
                  color: selected === item.name ? "#3191CF" : "#000000",
                  textDecoration: selected === item.name ? "underline" : "none",
                }}
                to={item.linkTo ? item.linkTo : "#"}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="bell-container">
        <BellButton />
      </div>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" p={1} ml={4}>
              <FaCog size={24} />
            </Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item
                value="account"
              >
                <Link to="/account">
                My Account
                </Link>
              </Menu.Item>
              <Menu.Item
                value="logout"
              >
                <Link
                onClick={handleLogout}
                to="/login"
                >
                  Logout
                </Link>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </div>
    </header>
  );
});

export default Header;
