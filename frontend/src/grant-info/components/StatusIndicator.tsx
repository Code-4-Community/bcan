// StatusIndicator.tsx

import React from "react";
import { FaCircle } from "react-icons/fa";

interface StatusIndicatorProps {
  isActive: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isActive }) => {
  const circleColor = isActive ? "#5AB911" : "#A9A9A9"; // #5AB911 = bright green from Figma
  const labelText = isActive ? "Active" : "Inactive";

  return (
    <div className="justify-self-center">
    <span className="flex items-center">
      <FaCircle style={{ color: circleColor}} className="mr-8" />
      {/* The text label: #000, "Helvetica Neue", 28px */}
      <span className="w-16 text-left">{labelText}</span>
    </span>
    </div>
  );
};

export default StatusIndicator;
