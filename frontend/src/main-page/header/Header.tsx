import { Link } from "react-router-dom";
import "./styles/Header.css";
import logo from "../../images/bcan_logo.svg";
import {
  Status,
  statusToString,
} from "../../../../middle-layer/types/Status.ts";
import {
  updateFilter,
  logoutUser,
} from "../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import { Menu, Button } from "@chakra-ui/react";
import { FaCog } from "react-icons/fa";
import BellButton from "./Bell.tsx";
import { useLocation } from 'react-router-dom';
import UserButton from "./UserButton.tsx";

interface NavBarProps {
  name: string;
  linkTo?: string;
  filter?: Status;
}

const linkList: NavBarProps[] = [
  { name: "Dashboard", linkTo: "/main/dashboard" },
  { name: "All Grants", linkTo: "/main/all-grants" },
  { name: "My Grants", linkTo: "/main/my-grants" },
];

/**
 * Header component provides the main navigation along with a settings cog.
 * The cog displays a dropdown with "My Account" and "Logout" options.
 */
const Header: React.FC = observer(() => {

  function categoryClicked(
    e: React.MouseEvent,
    category: string,
    linkTo?: string
  ) {
    if (!linkTo) {
      e.preventDefault();
      updateFilter(statusToString(category));
    }
  }

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <header className="header bg-pale-orange drop-shadow-md">
      <div className="header-left-comp">
        <img className="logo" src={logo} alt="BCAN Logo" />
      </div>
      <div className="header-right-comp">
        <ul className="flex gap-8">
          {linkList.map((item, index) => (
            <li key={index}>
              <Link
                onClick={(e) => categoryClicked(e, item.name, item.linkTo)}
                to={item.linkTo ? item.linkTo : "#"}
              >
                <div
                  className={`header-button header-button${
                    useLocation().pathname === item.linkTo ? "-selected" : ""
                  } hover:bg-medium-orange`}
                >
                  {item.name}
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <div className="header-right-controls flex items-center gap-2">
          <div className="bell-container">
            <BellButton />
          </div>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" p={1}>
                <FaCog size={24} />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="account">
                  <Link to="/account">My Account</Link>
                </Menu.Item>
                <Menu.Item value="logout">
                  <Link onClick={handleLogout} to="/login">
                    Logout
                  </Link>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
          <UserButton />
        </div>
      </div>
    </header>
  );
});

export default Header;
