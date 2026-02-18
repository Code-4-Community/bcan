import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface NavTabProps {
  name: string;
  linkTo: string;
  icon: IconDefinition;
}

const NavTab: React.FC<NavTabProps> = ({ name, linkTo, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === linkTo;

  return (
    <Link
      to={linkTo}
      className={`flex items-center gap-3 w-[85%] pl-8 pr-4 py-3 rounded-r-full transition-colors hover:text-white ${
        isActive
          ? "bg-primary-900 font-medium text-white"
          : "hover:bg-grey-500"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      <span className="text-md">{name}</span>
    </Link>
  );
};

export default NavTab;