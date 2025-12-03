import { Link } from "react-router-dom";
import "./styles/Header.css";
import logo from "../../images/bcan_logo.svg";
import {
  Status,
  stringToStatus,
} from "../../../../middle-layer/types/Status.ts";
import {
  updateFilter,
} from "../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import BellButton from "./Bell.tsx";
import { useLocation } from 'react-router-dom';
import UserButton from "./UserButton.tsx";
import { useState } from "react";

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
  const [openModal, setOpenModal] = useState<string | null>(null);

  function categoryClicked(
    e: React.MouseEvent,
    category: string,
    linkTo?: string
  ) {
    if (!linkTo) {
      e.preventDefault();
      updateFilter(stringToStatus(category));
    }
  }

  
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
          <div className="bell-container" onClick={() => setOpenModal(openModal === "bell" ? null : "bell")}>
            <BellButton setOpenModal={setOpenModal} openModal={openModal} />
          </div>
          <div className="user-container" onClick={() => setOpenModal(openModal === "user" ? null : "user")}>
            <UserButton setOpenModal={setOpenModal} openModal={openModal} />
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
