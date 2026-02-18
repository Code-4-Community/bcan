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
      className="inline-flex w-fit flex-none items-center rounded-sm px-2 py-1"
      style={{ color: darkColor, backgroundColor: lightColor }}
    >
      <span className="text-md">{labelText}</span>
    </div>
  );
};

export default StatusIndicator;
