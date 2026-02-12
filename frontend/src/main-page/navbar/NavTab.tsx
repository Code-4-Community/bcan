import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface NavTabProps {
  to: string;
  icon: IconDefinition;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}

const NavTab: React.FC<NavTabProps> = ({ to, icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 pl-8 pr-4 py-3 rounded-r-full transition-colors hover:text-white ${
        isActive
          ? "bg-primary-900 font-medium text-white"
          : "hover:bg-grey-500"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="w-5 h-5" />
      <span className="text-md">{label}</span>
    </Link>
  );
};

export default NavTab;