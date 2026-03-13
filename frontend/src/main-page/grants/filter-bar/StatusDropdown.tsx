
import React from "react";
import {
  Status,
  getColorStatus,
} from "../../../../../middle-layer/types/Status.ts";
import { observer } from "mobx-react-lite";

interface StatusDropdownProps {
  selected: Status | null;
  onSelect: (status: Status) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = observer(({ selected, onSelect }) => {
  const statuses = Object.values(Status);

  return (
    <div className="absolute left-0 top-full mt-2 bg-white border border-primary-900 rounded-md p-4 z-50 shadow-lg min-w-[25rem] overflow-x-auto">
      <div className="grid grid-cols-3 gap-2">
        {statuses.map((status) => (
          <div
            key={status}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onSelect(status)}
          >
            <input
              type="checkbox"
              checked={selected === status}
              onChange={() => onSelect(status)}
              className="cursor-pointer w-4 h-4 flex-shrink-0"
            />
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: getColorStatus(status, "light"),
                color: getColorStatus(status, "dark"),
              }}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default StatusDropdown;
