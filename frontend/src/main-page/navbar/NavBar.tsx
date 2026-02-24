import { useNavigate } from "react-router-dom";
import {
  logoutUser
} from "../../external/bcanSatchel/actions.ts";
import { observer } from "mobx-react-lite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faRightFromBracket, faUser, faBorderNone } from "@fortawesome/free-solid-svg-icons";
import { getAppStore } from "../../external/bcanSatchel/store";
import { UserStatus } from "../../../../middle-layer/types/UserStatus";
import NavTab, { NavTabProps } from "./NavTab.tsx";
import { faChartLine, faMoneyBill, faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { NavBarBranding } from "../../translations/general.ts";

const tabs: NavTabProps[] = [
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

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };
  
  return (
    <aside className="left-0 top-0 h-screen w-52 lg:w-56 bg-white flex flex-col">
      {/* Logo at top */}
      <div className="p-6 flex items-center justify-center mr-4">
        <img className="w-12 h-12" src={NavBarBranding.logo} alt={`${NavBarBranding.name} Logo`} />
        <span className="ml-3 text-xl font-semibold">{NavBarBranding.name}</span>
      </div>

      {/* Navigation links - stacked vertically */}
      <nav className="py-8 pr-4">
        <ul className="flex flex-col gap-2">
          {tabs.map((item, index) => (
            <li key={index}>
              <NavTab
                name={item.name} // default name if not provided (shouldn't happen since all items have names)
                icon={item.icon || faBorderNone} // default icon if not provided (shouldn't happen since all items have icons)
                linkTo={item.linkTo || "#"}
              />
            </li>
          ))}
          
          {/* Admin-only Users tab */}
          {isAdmin && (
            <li>
              <NavTab
                name="Users"
                linkTo="/main/users"
                icon={faUser}
              />
            </li>
          )}
        </ul>
      </nav>

      {/*vSettings and Sign Out Section */}
      <div className="border-t-2 border-primary-700 py-4 pr-4">
        <div className="flex flex-col gap-2 mt-2">
          <NavTab
            name="Settings"
            linkTo="/main/settings"
            icon={faGear}
          />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-[85%] pl-8 pr-4 py-3 rounded-r-full transition-colors hover:bg-grey-500 hover:text-white text-left border-none font-medium"
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
