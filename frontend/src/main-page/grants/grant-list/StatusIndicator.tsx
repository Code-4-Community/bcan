// StatusIndicator.tsx

import React from "react";
import { FaCircle } from "react-icons/fa";
import { Status, getColorStatus } from "../../../../../middle-layer/types/Status.ts";

interface StatusIndicatorProps {
  curStatus: Status;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ curStatus }) => {
  const circleColor = getColorStatus(curStatus.toString())
  const labelText = curStatus; // curStatus from the json is stored as a string, so can directly use

  return (
    <div className="justify-self-center">
    <span className="flex items-center">
      <FaCircle style={{ color: circleColor}} className="mr-4" />
      {/* The text label: #000, "Helvetica Neue", 28px */}
      <span className="w-20 text-left">{labelText}</span>
    </span>
    </div>
  );
};

export default StatusIndicator;
