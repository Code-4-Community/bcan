// StatusIndicator.tsx

import React from "react";
import {
  Status,
  getColorStatus,
} from "../../../../../../middle-layer/types/Status.ts";

interface StatusIndicatorProps {
  curStatus: Status;
  onClick?: () => void; 
  active?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ curStatus, onClick, active }) => {
  const lightColor = getColorStatus(curStatus.toString(), "light");
  const darkColor = getColorStatus(curStatus.toString(), "dark");
  const labelText = curStatus; // curStatus from the json is stored as a string, so can directly use

  return (
    <button
      className="inline-flex w-fit cursor-default flex-none items-center rounded-full px-3 py-1 border-grey-300 border-2 text-gray-700 hover:border-primary-900 text-sm lg:text-base"
      style={active !== false ? { color: darkColor, backgroundColor: lightColor, borderColor: lightColor } : {}}
      onClick={onClick}

     // text-gray-700 px-3 py-1 text-sm border-2 ${status === btn.id ? "bg-primary-800 border-primary-800" : "border-grey-300
    >
      <span className="text-md">{labelText}</span>
    </button>
  );
};

export default StatusIndicator;
