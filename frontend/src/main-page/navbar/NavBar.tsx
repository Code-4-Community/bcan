import { Link, useNavigate } from "react-router-dom";
import "./styles/Header.css";
import logo from "../../images/logo.svg";
import {
  Status,
  stringToStatus,
} from "../../../../middle-layer/types/Status.ts";
import {
  logoutUser,
  updateFilter,
} from "../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faMoneyBill, faClipboardCheck, faGear, faRightFromBracket, faUsers } from "@fortawesome/free-solid-svg-icons";
import { getAppStore } from "../../external/bcanSatchel/store";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";

interface NavBarProps {
  name: string;
  linkTo?: string;
  filter?: Status;
  icon?: any;
}

const linkList: NavBarProps[] = [
  { name: "Dashboard", linkTo: "/main/dashboard", icon: faChartLine },
  { name: "Grants", linkTo: "/main/all-grants", icon: faClipboardCheck },
  { name: "Cash Flow", linkTo: "/main/cash-flow", icon: faMoneyBill },
];

/**
 * Sidebar component provides the main navigation.
 */
const NavBar: React.FC = observer(() => {
  const navigate = useNavigate();
  const user = getAppStore().user;
  const isAdmin = user?.position === UserStatus.Admin;

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

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  
  return (
    <aside className="left-0 top-0 h-screen w-56 bg-white flex flex-col">
      {/* Logo at top */}
      <div className="p-6 flex items-center justify-center mr-6">
        <img className="w-12 h-12" src={logo} alt="BCAN Logo" />
        <span className="ml-3 text-xl font-semibold">BostonCan</span>
      </div>

      {/* Navigation links - stacked vertically */}
      <nav className="py-8 pr-4">
        <ul className="flex flex-col gap-2">
          {linkList.map((item, index) => (
            <li key={index}>
              <Link
                onClick={(e) => categoryClicked(e, item.name, item.linkTo)}
                to={item.linkTo ? item.linkTo : "#"}
                className={`flex items-center gap-3 pl-8 pr-4 py-3 rounded-r-full transition-colors hover:text-white ${
                  useLocation().pathname === item.linkTo
                    ? "bg-primary-900 font-medium text-white"
                    : "hover:bg-grey-500"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                <span className="text-md">{item.name}</span>
              </Link>
            </li>
          ))}
          
          {/* Admin-only Users tab */}
          {isAdmin && (
            <li>
              <Link
                to="/main/users"
                className={`flex items-center gap-3 pl-8 pr-4 py-3 rounded-r-full transition-colors hover:text-white ${
                  useLocation().pathname === "/main/users"
                    ? "bg-primary-900 font-medium text-white"
                    : "hover:bg-grey-500"
                }`}
              >
                <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
                <span className="text-md">Users</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Bottom controls - Settings and Sign Out */}
      <div className="border-t-2 border-primary-700 py-4 pr-4">
        <div className="flex flex-col gap-2 mt-2">
          <Link
            to="/main/settings"
            className={`flex items-center gap-3 pl-8 pr-4 py-3 rounded-r-full transition-colors hover:text-white ${
              useLocation().pathname === "/main/settings"
                ? "bg-primary-900 font-medium text-white"
                : "hover:bg-grey-500"
            }`}
          >
            <FontAwesomeIcon icon={faGear} className="w-5 h-5" />
            <span className="text-md">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 pl-8 pr-4 py-3 rounded-r-full transition-colors hover:bg-grey-500 hover:text-white text-left border-none font-medium"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
            <span className="text-md">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
});

export default NavBar;
