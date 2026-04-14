
import React from "react";
import {
  Status,
  getColorStatus,
} from "../../../../../../middle-layer/types/Status.ts";
import { observer } from "mobx-react-lite";
import CheckboxField from "../../../../components/CheckboxField";

interface StatusDropdownProps {
  selected: Status[];
  onSelect: (status: Status) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = observer(({ selected, onSelect }) => {
  const statuses = Object.values(Status);

  return (
    <div className="absolute left-0 top-full mt-2 bg-white border border-primary-900 rounded-md p-4 z-50 shadow-lg min-w-[25rem] overflow-x-auto">
      <div className="grid grid-cols-3 gap-2">
        {statuses.map((status) => (
          <CheckboxField
            key={status}
            id={`status-filter-${String(status)}`}
            checked={selected.includes(status)}
            onChange={() => onSelect(status)}
            label={
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: getColorStatus(status, "light"),
                  color: getColorStatus(status, "dark"),
                }}
              >
                {status}
              </span>
            }
          />
        ))}
      </div>
    </div>
  );
});

export default StatusDropdown;
