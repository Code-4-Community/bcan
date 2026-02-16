// StatusIndicator.tsx

import React from "react";
import {
  Status,
  getColorStatus,
} from "../../../../../middle-layer/types/Status.ts";

interface StatusIndicatorProps {
  curStatus: Status;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ curStatus }) => {
  const lightColor = getColorStatus(curStatus.toString(), "light");
  const darkColor = getColorStatus(curStatus.toString(), "dark");
  const labelText = curStatus; // curStatus from the json is stored as a string, so can directly use

  return (
    <div
      className="flex items-center rounded-sm p-2"
      style={{ color: darkColor, backgroundColor: lightColor }}
    >
      <span className="text-sm">{labelText}</span>
    </div>
  );
};

export default StatusIndicator;
