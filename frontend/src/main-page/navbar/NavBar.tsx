import { Link } from "react-router-dom";
import "./styles/Header.css";
import logo from "../../images/logo.svg";
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
  { name: "Grants", linkTo: "/main/all-grants" },
  { name: "Cash Flow", linkTo: "/main/cash-flow" },
];

/**
 * Header component provides the main navigation along with a settings cog.
 * The cog displays a dropdown with "My Account" and "Logout" options.
 */
const NavBar: React.FC = observer(() => {

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
    <aside className="left-0 top-0 h-screen w-56 flex-shrink-0 bg-white drop-shadow-lg flex flex-col">
      {/* Logo at top */}
      <div className="p-6 flex items-center justify-center border-b border-gray-200">
        <img className="w-12 h-12" src={logo} alt="BCAN Logo" />
        <span className="ml-3 text-xl font-semibold">BostonCan</span>
      </div>

      {/* Navigation links - stacked vertically */}
      <nav className="flex-1 py-8 px-4">
        <ul className="flex flex-col gap-2">
          {linkList.map((item, index) => (
            <li key={index}>
              <Link
                onClick={(e) => categoryClicked(e, item.name, item.linkTo)}
                to={item.linkTo ? item.linkTo : "#"}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  useLocation().pathname === item.linkTo
                    ? "bg-primary-700 font-semibold border border-black"
                    : "hover:bg-primary-800"
                }`}
              >
                <span className="text-sm">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom controls - Settings and Sign Out */}
      <div className="border-t border-orange py-4 px-4">
        <div className="flex flex-col gap-2">
        </div>
      </div>
    </aside>
  );
});

export default NavBar;
